import React, { useState, useEffect, useRef } from 'react';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import { Player, Friend, ChatMessage, SportType } from '../types';
import {
  X,
  Send,
  MessageSquare,
  ShieldCheck,
  Calendar,
  MapPin,
  Sparkles,
  Users,
  Check,
  Radio,
  BarChart3,
  PhoneCall,
  Flame,
} from 'lucide-react';

export const ChatMessengerModal: React.FC = () => {
  const {
    isChatOpen,
    closeChat,
    activeChatPlayer,
    openChatWithPlayer,
    friends,
    chatMessages,
    sendMessage,
    openPlayerStatsModal,
  } = useSocial();
  const { userProfile, user } = useAuth();

  const [inputMessage, setInputMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'conversation' | 'friendsList'>('conversation');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fallback to first friend if no active chat player selected
  const targetPlayer: Player | Friend | null =
    activeChatPlayer || (friends.length > 0 ? friends[0] : null);

  const currentUserId = user?.uid || 'usr_me';
  const threadMessages: ChatMessage[] = targetPlayer ? chatMessages[targetPlayer.id] || [] : [];

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [threadMessages, isChatOpen]);

  if (!isChatOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !targetPlayer) return;

    await sendMessage(targetPlayer.id, targetPlayer.name, inputMessage.trim());
    setInputMessage('');
  };

  const handleSendQuickPrompt = async (promptText: string, isInvite = false, inviteSport: SportType = 'cricket') => {
    if (!targetPlayer) return;
    await sendMessage(
      targetPlayer.id,
      targetPlayer.name,
      promptText,
      isInvite,
      isInvite
        ? {
            sport: inviteSport,
            venueName: 'Play Arena Turf Complex',
            time: 'Tonight, 08:00 PM',
          }
        : undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 h-[640px] max-h-[92vh] flex overflow-hidden">
        {/* Left: Friends & Conversations Sidebar (Desktop & Tablet) */}
        <div className="w-72 bg-slate-50 dark:bg-slate-850 border-r border-slate-250 dark:border-slate-800 hidden md:flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Sports Friends ({friends.length})
              </h3>
            </div>
          </div>

          {/* Friends List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {friends.length === 0 ? (
              <div className="py-12 text-center text-slate-400 px-4 space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-bold">No friends connected yet</p>
                <p className="text-[11px]">Add players from the 10km Active Players Map to chat!</p>
              </div>
            ) : (
              friends.map((friend) => {
                const isSelected = targetPlayer?.id === friend.playerId || targetPlayer?.id === friend.id;
                const lastMsg = (chatMessages[friend.playerId] || [])[
                  (chatMessages[friend.playerId] || []).length - 1
                ];

                return (
                  <button
                    key={friend.id}
                    onClick={() => openChatWithPlayer(friend as any)}
                    className={`w-full p-2.5 rounded-2xl flex items-center gap-3 transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                          friend.status === 'online'
                            ? 'bg-emerald-500'
                            : friend.status === 'in_match'
                            ? 'bg-blue-500'
                            : 'bg-slate-400'
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black truncate">{friend.name}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                          ★ {friend.rating}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] truncate ${
                          isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {lastMsg ? lastMsg.text : friend.levelTitle}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat Conversation Thread */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
          {targetPlayer ? (
            <>
              {/* Chat Thread Header */}
              <div className="p-3.5 sm:p-4 bg-slate-50/90 dark:bg-slate-850/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={targetPlayer.avatar}
                      alt={targetPlayer.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-blue-500"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {targetPlayer.name}
                      </h3>
                      <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Radio className="w-2.5 h-2.5 animate-pulse" />
                        Online Now
                      </span>
                      <span>•</span>
                      <span className="truncate">{targetPlayer.levelTitle}</span>
                    </div>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openPlayerStatsModal(targetPlayer as any)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    title="View Statistics"
                  >
                    <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </button>

                  <button
                    onClick={closeChat}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Close Chat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Flow Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-slate-950/30">
                {/* Security and Fair Play notice */}
                <div className="max-w-md mx-auto p-2.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/50 text-center text-[11px] text-blue-800 dark:text-blue-300 font-medium">
                  🔒 Messages are encrypted. You can invite {targetPlayer.name} to games or discuss court bookings directly.
                </div>

                {threadMessages.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-bold">Start a conversation with {targetPlayer.name}</p>
                    <p className="text-[11px]">Send a match invite or tap one of the quick game prompts below.</p>
                  </div>
                ) : (
                  threadMessages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${
                          isMe ? 'ml-auto' : 'mr-auto'
                        }`}
                      >
                        <div
                          className={`p-3 rounded-2xl text-xs font-medium ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200 dark:border-slate-700 shadow-xs'
                          }`}
                        >
                          {/* If Quick Match Invite Card */}
                          {msg.isQuickInvite && msg.inviteDetails && (
                            <div className="mb-2 p-2.5 rounded-xl bg-black/15 border border-white/20 space-y-1">
                              <div className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1 opacity-90">
                                🏆 Game Pickup Invite
                              </div>
                              <div className="text-xs font-bold">
                                {msg.inviteDetails.venueName}
                              </div>
                              <div className="text-[11px] opacity-85">
                                ⏰ {msg.inviteDetails.time}
                              </div>
                            </div>
                          )}

                          <p className="leading-relaxed">{msg.text}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {msg.timestamp}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Game Prompts Bar */}
              <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 px-1">
                  Quick Prompts:
                </span>
                <button
                  onClick={() => handleSendQuickPrompt('🏏 Hey! Free for 7v7 Box Cricket tonight at 8 PM?', true, 'cricket')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-[11px] font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap cursor-pointer"
                >
                  🏏 Box Cricket Invite
                </button>
                <button
                  onClick={() => handleSendQuickPrompt('🏸 Up for evening Badminton doubles at Play Arena?', true, 'badminton')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-[11px] font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap cursor-pointer"
                >
                  🏸 Badminton Invite
                </button>
                <button
                  onClick={() => handleSendQuickPrompt('⚽ We have 9 players for 5v5 Futsal, need 1 more! Are you in?', true, 'football')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-[11px] font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap cursor-pointer"
                >
                  ⚽ Futsal 5v5 Invite
                </button>
              </div>

              {/* Text Input Footer */}
              <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Message ${targetPlayer.name}...`}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 border border-transparent focus:border-blue-600 focus:outline-hidden"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600" />
              <h3 className="text-sm font-black text-slate-700 dark:text-slate-300">
                Select a Player or Friend to Start Chatting
              </h3>
              <p className="text-xs max-w-sm">
                Pick a friend from the left sidebar or browse active players on the 10km radar map.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
