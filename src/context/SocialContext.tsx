import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ActivePlayerOnMap,
  Friend,
  ChatMessage,
  RecentTeammate,
  PlayerRatingSubmission,
  Player,
  SportType,
} from '../types';
import {
  INITIAL_ACTIVE_PLAYERS,
  INITIAL_FRIENDS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_RECENT_TEAMMATES,
  CURRENT_USER_DETAILED_STATS,
} from '../data/activePlayersData';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc, collection, onSnapshot, getDocs } from 'firebase/firestore';

interface SocialContextType {
  activePlayers: ActivePlayerOnMap[];
  friends: Friend[];
  chatMessages: Record<string, ChatMessage[]>;
  recentTeammates: RecentTeammate[];
  activeChatPlayer: Player | null;
  isChatOpen: boolean;
  selectedPlayerForStats: (Player & { stats?: any }) | null;
  rateTargetTeammate: RecentTeammate | null;
  addFriend: (player: Player) => Promise<void>;
  removeFriend: (playerId: string) => Promise<void>;
  openChatWithPlayer: (player: Player) => void;
  closeChat: () => void;
  sendMessage: (receiverId: string, receiverName: string, text: string, isQuickInvite?: boolean, inviteDetails?: any) => Promise<void>;
  openRatePlayerModal: (teammate: RecentTeammate) => void;
  closeRatePlayerModal: () => void;
  submitPlayerRating: (submission: PlayerRatingSubmission) => Promise<void>;
  openPlayerStatsModal: (player: Player) => void;
  closePlayerStatsModal: () => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();

  const [activePlayers, setActivePlayers] = useState<ActivePlayerOnMap[]>(INITIAL_ACTIVE_PLAYERS);
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_CHAT_MESSAGES);
  const [recentTeammates, setRecentTeammates] = useState<RecentTeammate[]>(INITIAL_RECENT_TEAMMATES);

  // Modals & Active Interactivity
  const [activeChatPlayer, setActiveChatPlayer] = useState<Player | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [selectedPlayerForStats, setSelectedPlayerForStats] = useState<(Player & { stats?: any }) | null>(null);
  const [rateTargetTeammate, setRateTargetTeammate] = useState<RecentTeammate | null>(null);

  // Sync Friends with Firestore if user is authenticated
  useEffect(() => {
    if (!user) return;

    try {
      const friendsColRef = collection(db, 'users', user.uid, 'friends');
      const unsubscribe = onSnapshot(friendsColRef, (snapshot) => {
        if (!snapshot.empty) {
          const loadedFriends: Friend[] = [];
          snapshot.forEach((docSnap) => {
            loadedFriends.push(docSnap.data() as Friend);
          });
          setFriends(loadedFriends);
        }
      }, (error) => {
        console.warn('Firestore friends listen error, using local state:', error);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore error in SocialProvider:', e);
    }
  }, [user]);

  // Add Friend
  const addFriend = async (player: Player) => {
    const isAlready = friends.some((f) => f.playerId === player.id);
    if (isAlready) return;

    const newFriend: Friend = {
      id: `fr_${Date.now()}`,
      playerId: player.id,
      name: player.name,
      avatar: player.avatar,
      sport: (player as any).activeSport || 'cricket',
      levelTitle: player.levelTitle,
      rating: player.rating,
      status: 'online',
      statusText: 'Connected Sports Friend',
      lastSeen: 'Online now',
      matchesTogether: 1,
      locality: player.locality || 'Nearby Locality',
    };

    setFriends((prev) => [newFriend, ...prev]);

    // Update active players status
    setActivePlayers((prev) =>
      prev.map((p) =>
        p.id === player.id ? { ...p, isFriend: true, friendStatus: 'friends' } : p
      )
    );

    if (user) {
      try {
        const friendDocRef = doc(db, 'users', user.uid, 'friends', player.id);
        await setDoc(friendDocRef, newFriend);
      } catch (e) {
        console.warn('Could not persist friend to Firestore:', e);
      }
    }
  };

  // Remove Friend
  const removeFriend = async (playerId: string) => {
    setFriends((prev) => prev.filter((f) => f.playerId !== playerId));
    setActivePlayers((prev) =>
      prev.map((p) =>
        p.id === playerId ? { ...p, isFriend: false, friendStatus: 'none' } : p
      )
    );
  };

  // Chat controls
  const openChatWithPlayer = (player: Player) => {
    setActiveChatPlayer(player);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  // Send Message
  const sendMessage = async (
    receiverId: string,
    receiverName: string,
    text: string,
    isQuickInvite?: boolean,
    inviteDetails?: any
  ) => {
    const currentUserId = user?.uid || 'usr_me';
    const currentUserName = userProfile?.displayName || user?.displayName || 'Arjun Mehta';
    const currentUserAvatar = userProfile?.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      senderId: currentUserId,
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
      receiverId,
      receiverName,
      text,
      timestamp: 'Just now',
      isQuickInvite,
      inviteDetails,
    };

    setChatMessages((prev) => {
      const existing = prev[receiverId] || [];
      return {
        ...prev,
        [receiverId]: [...existing, newMsg],
      };
    });

    // Also persist to Firestore if available
    if (user) {
      try {
        const chatId = [currentUserId, receiverId].sort().join('_');
        const msgDocRef = doc(db, 'chats', chatId, 'messages', newMsg.id);
        await setDoc(msgDocRef, newMsg);
      } catch (e) {
        console.warn('Firestore message save error:', e);
      }
    }

    // Auto-respond simulation after 1.5 seconds if talking with a bot/demo player
    if (receiverId.startsWith('ply_')) {
      setTimeout(() => {
        const autoResponses = [
          `Awesome! Sounds like a plan, let's play! 🏆`,
          `Got it! I will bring my sports kit and be there 10 mins early.`,
          `Count me in! What time should we reach the venue?`,
          `Great connecting! Looking forward to our next match together. 🏏`,
        ];
        const randomResp = autoResponses[Math.floor(Math.random() * autoResponses.length)];
        const replyMsg: ChatMessage = {
          id: `reply_${Date.now()}`,
          senderId: receiverId,
          senderName: receiverName,
          receiverId: currentUserId,
          receiverName: currentUserName,
          text: randomResp,
          timestamp: 'Just now',
        };

        setChatMessages((prev) => {
          const existing = prev[receiverId] || [];
          return {
            ...prev,
            [receiverId]: [...existing, replyMsg],
          };
        });
      }, 1400);
    }
  };

  // Rate Player Modal controls
  const openRatePlayerModal = (teammate: RecentTeammate) => {
    setRateTargetTeammate(teammate);
  };

  const closeRatePlayerModal = () => {
    setRateTargetTeammate(null);
  };

  // Submit Rating
  const submitPlayerRating = async (submission: PlayerRatingSubmission) => {
    // 1. Mark teammate as rated
    setRecentTeammates((prev) =>
      prev.map((t) =>
        t.player.id === submission.targetPlayerId && t.matchId === submission.matchId
          ? { ...t, hasRated: true, existingRating: submission }
          : t
      )
    );

    // 2. Increment target player rating slightly in active players
    setActivePlayers((prev) =>
      prev.map((p) => {
        if (p.id === submission.targetPlayerId) {
          const newRating = Number(((p.rating * 5 + submission.overallRating) / 6).toFixed(1));
          return {
            ...p,
            rating: newRating,
            stats: {
              ...p.stats,
              fairPlayRating: Number(((p.stats.fairPlayRating * 5 + submission.sportsmanshipRating) / 6).toFixed(1)),
              punctualityRating: Number(((p.stats.punctualityRating * 5 + submission.punctualityRating) / 6).toFixed(1)),
            },
          };
        }
        return p;
      })
    );

    // 3. Persist rating to Firestore
    if (user) {
      try {
        const ratingId = `rtg_${Date.now()}`;
        const ratingDocRef = doc(db, 'ratings', ratingId);
        await setDoc(ratingDocRef, { ...submission, id: ratingId });
      } catch (e) {
        console.warn('Firestore rating save error:', e);
      }
    }

    closeRatePlayerModal();
  };

  // Player Stats modal
  const openPlayerStatsModal = (player: Player) => {
    // Attach default stats if player doesn't have stats
    const activeFound = activePlayers.find((p) => p.id === player.id);
    const statsToUse = activeFound?.stats || player.stats || CURRENT_USER_DETAILED_STATS;
    setSelectedPlayerForStats({
      ...player,
      stats: statsToUse,
    });
  };

  const closePlayerStatsModal = () => {
    setSelectedPlayerForStats(null);
  };

  return (
    <SocialContext.Provider
      value={{
        activePlayers,
        friends,
        chatMessages,
        recentTeammates,
        activeChatPlayer,
        isChatOpen,
        selectedPlayerForStats,
        rateTargetTeammate,
        addFriend,
        removeFriend,
        openChatWithPlayer,
        closeChat,
        sendMessage,
        openRatePlayerModal,
        closeRatePlayerModal,
        submitPlayerRating,
        openPlayerStatsModal,
        closePlayerStatsModal,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};
