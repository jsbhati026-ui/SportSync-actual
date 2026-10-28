import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, updateDoc, writeBatch } from 'firebase/firestore';
import { auth, db, googleProvider, signInWithPopup, signOut } from '../lib/firebase';
import { UserProfile, MatchNotification, SportType } from '../types';
import { getCoordinatesForArea } from '../lib/geoNotifications';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  notifications: MatchNotification[];
  unreadNotificationsCount: number;
  signInWithGoogle: () => Promise<void>;
  signInDemoUser: (sampleProfile?: Partial<UserProfile>) => void;
  registerAsNewAthlete: (name?: string) => void;
  logout: () => Promise<void>;
  saveSportsInterests: (sports: SportType[], area: string, city: string, lat?: number, lng?: number) => Promise<void>;
  updateCity: (city: string, area?: string, lat?: number, lng?: number) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  addProximityNotification: (notification: MatchNotification) => void;
  isPro: boolean;
  isProModalOpen: boolean;
  setIsProModalOpen: (open: boolean) => void;
  upgradeToPro: () => Promise<void>;
  isMyStatsOpen: boolean;
  setIsMyStatsOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<MatchNotification[]>([]);
  const [isProModalOpen, setIsProModalOpen] = useState<boolean>(false);
  const [isMyStatsOpen, setIsMyStatsOpen] = useState<boolean>(false);
  const [localProUserMap, setLocalProUserMap] = useState<Record<string, boolean>>({});

  // Clean up any stale global legacy key so new users are never auto-assigned Pro
  useEffect(() => {
    try {
      localStorage.removeItem('sportsync_pro_status');
    } catch {}
  }, []);

  // Strict per-user Pro subscription determination:
  // Brand new users default to false. Only true if their specific account has an active Pro subscription.
  const isPro = useMemo(() => {
    if (!user && !userProfile) return false;
    const activeUid = user?.uid || userProfile?.uid;
    
    // 1. Profile explicitly has isPro: true and not expired
    if (userProfile?.isPro === true) {
      if (userProfile.proExpiresAt && new Date(userProfile.proExpiresAt).getTime() < Date.now()) {
        return false;
      }
      return true;
    }

    // 2. In-memory per-UID map
    if (activeUid && localProUserMap[activeUid]) {
      return true;
    }

    // 3. User-specific localStorage entry (e.g. sportsync_pro_{uid})
    if (activeUid) {
      try {
        const status = localStorage.getItem(`sportsync_pro_${activeUid}`);
        if (status === 'active') {
          return true;
        }
      } catch {}
    }

    return false;
  }, [user, userProfile, localProUserMap]);

  const upgradeToPro = async () => {
    const activeUid = user?.uid || userProfile?.uid || 'current_athlete';
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    try {
      localStorage.setItem(`sportsync_pro_${activeUid}`, 'active');
    } catch {}

    setLocalProUserMap((prev) => ({ ...prev, [activeUid]: true }));

    setUserProfile((prev) =>
      prev
        ? {
            ...prev,
            isPro: true,
            proExpiresAt: expiresAt,
          }
        : null
    );

    if (user?.uid) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          isPro: true,
          proExpiresAt: expiresAt,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Could not update Pro status in Firestore:', err);
      }
    }
    setIsProModalOpen(false);
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setUserProfile(data);
            if (!data.onboardingCompleted || !data.favoriteSports || data.favoriteSports.length === 0) {
              setIsOnboardingOpen(true);
            }
          } else {
            // New registered user! Set standard (free) account and trigger Sports Onboarding
            const defaultCoords = getCoordinatesForArea('Sector 12', 'Chandigarh');
            const initialProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'Sports Player',
              photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
              favoriteSports: [],
              city: 'Chandigarh',
              area: 'Sector 12',
              lat: defaultCoords.lat,
              lng: defaultCoords.lng,
              onboardingCompleted: false,
              isPro: false, // Strictly standard/free upon registration!
              createdAt: new Date().toISOString(),
            };

            await setDoc(userDocRef, initialProfile);
            setUserProfile(initialProfile);
            setIsOnboardingOpen(true);
          }
        } catch (err) {
          console.warn('Error reading user profile from Firestore:', err);
          // Fallback profile if Firestore read has issues
          setUserProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'Sports Athlete',
            photoURL: firebaseUser.photoURL,
            favoriteSports: ['cricket', 'badminton'],
            city: 'Chandigarh',
            area: 'Sector 12',
            lat: 30.7620,
            lng: 76.7725,
            onboardingCompleted: true,
            isPro: false,
          });
        }
      } else {
        // Check for local demo user if stored in session
        const savedDemo = sessionStorage.getItem('sportsync_demo_user');
        if (savedDemo) {
          try {
            const parsed = JSON.parse(savedDemo);
            setUserProfile(parsed);
          } catch {
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore notifications for the active user
  useEffect(() => {
    const activeUid = user?.uid || userProfile?.uid;
    if (!activeUid) {
      setNotifications([]);
      return;
    }

    try {
      const notifsColRef = collection(db, 'users', activeUid, 'notifications');
      const unsubscribe = onSnapshot(
        notifsColRef,
        (snapshot) => {
          const list: MatchNotification[] = [];
          snapshot.forEach((d) => {
            list.push(d.data() as MatchNotification);
          });
          // Sort newest first
          list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setNotifications(list);
        },
        (error) => {
          console.warn('Notification snapshot listener fallback:', error);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('Error attaching notification listener:', e);
    }
  }, [user?.uid, userProfile?.uid]);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Firebase Google Sign-In error:', err);
      // If user voluntarily closed the popup, do nothing
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      // If popup is blocked in iframe sandbox or domain is not whitelisted, sign in as athlete demo
      if (
        err.code === 'auth/popup-blocked' ||
        err.code === 'auth/cancelled-popup-request' ||
        err.code === 'auth/unauthorized-domain' ||
        err.message?.includes('popup')
      ) {
        console.warn('Google Auth popup was restricted by container or unauthorized domain. Activating demo athlete session.');
        signInDemoUser();
      } else {
        // Fallback demo session so the user is never stuck
        signInDemoUser();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Demo user helper to ensure 100% testability even without third-party cookie access in iframe
  const signInDemoUser = (customData?: Partial<UserProfile>) => {
    const demoProfile: UserProfile = {
      uid: 'demo_player_' + Math.random().toString(36).substring(2, 8),
      email: 'alex.sportsync@gmail.com',
      displayName: customData?.displayName || 'Alex Henderson',
      photoURL: customData?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      favoriteSports: customData?.favoriteSports || ['cricket', 'football', 'badminton'],
      city: customData?.city || 'Chandigarh',
      area: customData?.area || 'Sector 12',
      lat: customData?.lat || 30.7620,
      lng: customData?.lng || 76.7725,
      onboardingCompleted: true,
      isPro: false, // Standard (Free) user by default!
      ...customData,
    };
    setUserProfile(demoProfile);
    sessionStorage.setItem('sportsync_demo_user', JSON.stringify(demoProfile));
    setIsAuthModalOpen(false);

    // Pop up the Pro feature comparison window for the user
    setTimeout(() => {
      setIsProModalOpen(true);
    }, 400);
  };

  // Dedicated registration handler for brand new athletes
  const registerAsNewAthlete = (name: string = 'New Athlete') => {
    const newUid = 'athlete_' + Math.random().toString(36).substring(2, 9);
    const defaultCoords = getCoordinatesForArea('Sector 12', 'Chandigarh');
    const newProfile: UserProfile = {
      uid: newUid,
      email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'athlete'}@player.sportsync.in`,
      displayName: name,
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      favoriteSports: [],
      city: 'Chandigarh',
      area: 'Sector 12',
      lat: defaultCoords.lat,
      lng: defaultCoords.lng,
      onboardingCompleted: false,
      isPro: false, // Must be free plan!
      createdAt: new Date().toISOString(),
    };
    setUserProfile(newProfile);
    sessionStorage.setItem('sportsync_demo_user', JSON.stringify(newProfile));
    setIsAuthModalOpen(false);
    setIsOnboardingOpen(true);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setUser(null);
    setUserProfile(null);
    setLocalProUserMap({});
    sessionStorage.removeItem('sportsync_demo_user');
    setNotifications([]);
  };

  // Save sports preferences & coordinates (Onboarding / Profile update)
  const saveSportsInterests = async (
    sports: SportType[],
    area: string,
    city: string,
    lat?: number,
    lng?: number
  ) => {
    const coords = lat && lng ? { lat, lng } : getCoordinatesForArea(area, city);

    const updatedData: Partial<UserProfile> = {
      favoriteSports: sports,
      area,
      city,
      lat: coords.lat,
      lng: coords.lng,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    };

    if (user?.uid) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, updatedData);
      } catch (err) {
        console.warn('Error updating profile in Firestore:', err);
      }
    }

    setUserProfile((prev) => {
      const base: UserProfile = prev || {
        uid: user?.uid || 'guest_user',
        email: user?.email || null,
        displayName: user?.displayName || 'Sports Player',
        photoURL: user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        favoriteSports: sports,
        city,
        area,
        lat: coords.lat,
        lng: coords.lng,
        onboardingCompleted: true,
        isPro: false,
      };
      const updated = { ...base, ...updatedData, isPro: base.isPro === true };
      sessionStorage.setItem('sportsync_demo_user', JSON.stringify(updated));
      return updated;
    });

    setIsOnboardingOpen(false);

    // Pop up the Pro feature upgrade window to introduce the newly registered user to Pro features for ₹99!
    setTimeout(() => {
      setIsProModalOpen(true);
    }, 350);
  };

  // Immediate city and coordinates update (e.g. from navbar selector or GPS detect)
  const updateCity = async (city: string, area?: string, lat?: number, lng?: number) => {
    const coords = lat && lng ? { lat, lng } : getCoordinatesForArea(area || '', city);
    const resolvedArea = area || 'Central Area';

    setUserProfile((prev) => {
      const base: UserProfile = prev || {
        uid: user?.uid || 'guest_user',
        email: user?.email || null,
        displayName: user?.displayName || 'Sports Player',
        photoURL: user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        favoriteSports: ['cricket', 'badminton', 'football'],
        city,
        area: resolvedArea,
        lat: coords.lat,
        lng: coords.lng,
        onboardingCompleted: true,
      };
      const updated: UserProfile = {
        ...base,
        city,
        area: resolvedArea,
        lat: coords.lat,
        lng: coords.lng,
        updatedAt: new Date().toISOString(),
      };
      sessionStorage.setItem('sportsync_demo_user', JSON.stringify(updated));
      return updated;
    });

    if (user?.uid) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          city,
          area: resolvedArea,
          lat: coords.lat,
          lng: coords.lng,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Error syncing city in Firestore:', err);
      }
    }
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    const activeUid = user?.uid || userProfile?.uid;
    if (activeUid && !activeUid.startsWith('demo_')) {
      try {
        const docRef = doc(db, 'users', activeUid, 'notifications', id);
        await updateDoc(docRef, { read: true });
      } catch (e) {
        console.warn('Could not mark notification as read in Firestore:', e);
      }
    }
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    const activeUid = user?.uid || userProfile?.uid;
    if (activeUid && !activeUid.startsWith('demo_')) {
      try {
        const batch = writeBatch(db);
        notifications.forEach((n) => {
          const docRef = doc(db, 'users', activeUid, 'notifications', n.id);
          batch.delete(docRef);
        });
        await batch.commit();
      } catch (e) {
        console.warn('Could not clear notifications in Firestore:', e);
      }
    }
  };

  const addProximityNotification = (notification: MatchNotification) => {
    setNotifications((prev) => {
      // Prevent duplicates
      if (prev.some((n) => n.id === notification.id || (n.matchId === notification.matchId && n.userId === notification.userId))) {
        return prev;
      }
      return [notification, ...prev];
    });
  };

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isOnboardingOpen,
        setIsOnboardingOpen,
        notifications,
        unreadNotificationsCount,
        signInWithGoogle,
        signInDemoUser,
        registerAsNewAthlete,
        logout,
        saveSportsInterests,
        updateCity,
        markNotificationAsRead,
        clearAllNotifications,
        addProximityNotification,
        isPro,
        isProModalOpen,
        setIsProModalOpen,
        upgradeToPro,
        isMyStatsOpen,
        setIsMyStatsOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
