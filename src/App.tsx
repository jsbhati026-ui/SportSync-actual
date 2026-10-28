import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { VenueBookingSection } from './components/VenueBookingSection';
import { PlayerFinderSection } from './components/PlayerFinderSection';
import { SportsRentalSection } from './components/SportsRentalSection';
import { BookingModal } from './components/BookingModal';
import { HostMatchModal } from './components/HostMatchModal';
import { UserActivityDrawer } from './components/UserActivityDrawer';
import { AuthModal } from './components/AuthModal';
import { SportsOnboardingModal } from './components/SportsOnboardingModal';
import { NotificationsModal } from './components/NotificationsModal';
import { ChatMessengerModal } from './components/ChatMessengerModal';
import { PlayerRatingModal } from './components/PlayerRatingModal';
import { PlayerStatsModal } from './components/PlayerStatsModal';
import { ProSubscriptionModal } from './components/ProSubscriptionModal';
import { MyStatsModal } from './components/MyStatsModal';
import { SportSyncLogo } from './components/SportSyncLogo';
import { SportsEquipmentButton } from './components/SportsEquipmentButton';
import { useAuth } from './context/AuthContext';
import { triggerProximityMatchNotifications, getCoordinatesForArea, INDIAN_AREA_COORDS } from './lib/geoNotifications';
import { db } from './lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, getDoc, serverTimestamp, query } from 'firebase/firestore';
import {
  INITIAL_VENUES,
  INITIAL_OPEN_MATCHES,
  COMMUNITY_GEAR,
  CURRENT_USER,
} from './data/sportsData';
import {
  Venue,
  OpenMatch,
  SportType,
  VenueBookingRecord,
  JoinedMatchRecord,
  GearRentalRecord,
  CommunityGearItem,
  Player,
} from './types';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  // Navigation & Primary Filter State
  const [activeTab, setActiveTab] = useState<'venues' | 'players' | 'rental' | 'map'>('venues');
  const [selectedSport, setSelectedSport] = useState<SportType>('all');
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('sportsync_selected_city');
      if (saved) return saved;
    } catch {}
    return 'Chandigarh';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('Today');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('all');

  // Venues, Matches & P2P Gear State
  const [venues] = useState<Venue[]>(INITIAL_VENUES);
  const [matches, setMatches] = useState<OpenMatch[]>(INITIAL_OPEN_MATCHES);
  const [gearItems, setGearItems] = useState<CommunityGearItem[]>(COMMUNITY_GEAR);

  // Real-time Firestore synchronization for community open matches / squads
  useEffect(() => {
    try {
      const q = query(collection(db, 'matches'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const remoteMatches: OpenMatch[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            remoteMatches.push({
              id: docSnap.id,
              sport: data.sport,
              title: data.title,
              venueId: data.venueId || 'custom_v',
              venueName: data.venueName || 'Community Ground',
              courtName: data.courtName || 'Court 1',
              area: data.area || 'Local',
              city: data.city || 'Bengaluru',
              lat: data.lat,
              lng: data.lng,
              date: data.date || 'Today',
              time: data.time || '07:00 PM',
              durationMinutes: data.durationMinutes || 90,
              host: data.host,
              playersJoined: data.playersJoined || [],
              maxPlayers: data.maxPlayers || 8,
              costPerPlayer: data.costPerPlayer || 150,
              skillMin: data.skillMin || 3.0,
              skillMax: data.skillMax || 4.5,
              skillLabel: data.skillLabel || 'Intermediate',
              gameType: data.gameType || 'Friendly Match',
              gender: data.gender || 'Mixed',
              includesBallsOrShuttles: data.includesBallsOrShuttles ?? true,
              notes: data.notes || '',
              isLive: data.isLive ?? false,
              isLiveNow: data.isLiveNow ?? false,
              liveStatus: data.liveStatus || '',
              emergencyPlayersNeeded: data.emergencyPlayersNeeded,
              isUrgent: data.isUrgent ?? false,
              broadcastRadiusKm: data.broadcastRadiusKm || (data.isLiveNow ? 10 : 5),
            } as OpenMatch);
          });

          if (remoteMatches.length > 0) {
            setMatches((prev) => {
              const matchMap = new Map<string, OpenMatch>();
              INITIAL_OPEN_MATCHES.forEach((m) => matchMap.set(m.id, m));
              prev.forEach((m) => matchMap.set(m.id, m));
              remoteMatches.forEach((m) => matchMap.set(m.id, m));
              return Array.from(matchMap.values());
            });
          }
        },
        (err) => {
          console.warn('Matches subscription warning:', err);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Could not establish matches listener:', err);
    }
  }, []);

  // User History & Active Activity (Persistent for real users, no fake mock data)
  const [bookedVenues, setBookedVenues] = useState<VenueBookingRecord[]>(() => {
    try {
      const saved = localStorage.getItem('sportsync_booked_venues');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [joinedMatches, setJoinedMatches] = useState<JoinedMatchRecord[]>(() => {
    try {
      const saved = localStorage.getItem('sportsync_joined_matches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeRentals, setActiveRentals] = useState<GearRentalRecord[]>(() => {
    try {
      const saved = localStorage.getItem('sportsync_active_rentals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sportsync_booked_venues', JSON.stringify(bookedVenues));
    } catch {}
  }, [bookedVenues]);

  useEffect(() => {
    try {
      localStorage.setItem('sportsync_joined_matches', JSON.stringify(joinedMatches));
    } catch {}
  }, [joinedMatches]);

  useEffect(() => {
    try {
      localStorage.setItem('sportsync_active_rentals', JSON.stringify(activeRentals));
    } catch {}
  }, [activeRentals]);

  // Modals & Drawers
  const { user, userProfile, setIsOnboardingOpen, updateCity } = useAuth();
  const [bookingVenue, setBookingVenue] = useState<Venue | null>(null);
  const [isHostModalOpen, setIsHostModalOpen] = useState<boolean>(false);
  const [hostModalInitialLive, setHostModalInitialLive] = useState<boolean>(false);
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  const handleCityChange = (newCity: string) => {
    setSelectedCity(newCity);
    try {
      localStorage.setItem('sportsync_selected_city', newCity);
    } catch {}
    const coords = getCoordinatesForArea('', newCity);
    const defaultArea = Object.entries(INDIAN_AREA_COORDS).find(([_, d]) => d.city === newCity)?.[0] || newCity;
    updateCity(newCity, defaultArea, coords.lat, coords.lng);
  };

  // Dynamic user details derived from authenticated Google account / profile
  const activeUser: Player = useMemo(() => {
    const realName = userProfile?.displayName || user?.displayName || (user?.email ? user.email.split('@')[0] : 'My Sports Profile');
    const realAvatar = userProfile?.photoURL || user?.photoURL || CURRENT_USER.avatar;
    const locality = userProfile?.area && userProfile?.city ? `${userProfile.area}, ${userProfile.city}` : `${selectedCity}, India`;
    return {
      id: user?.uid || userProfile?.uid || CURRENT_USER.id,
      name: realName,
      avatar: realAvatar,
      rating: 4.9,
      levelTitle: userProfile?.favoriteSports?.length ? `${userProfile.favoriteSports[0]} Athlete` : 'Active Athlete',
      matchesPlayed: bookedVenues.length + joinedMatches.length,
      reliability: 99,
      badge: user ? 'Verified Athlete' : 'Community Member',
      locality,
    };
  }, [user, userProfile, bookedVenues.length, joinedMatches.length, selectedCity]);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handlers
  const handleConfirmCourtBooking = (newRecord: VenueBookingRecord) => {
    setBookedVenues((prev) => [newRecord, ...prev]);
    showToast(`Turf booked! Reference ${newRecord.bookingRef} ready.`);
  };

  const handleJoinMatch = async (match: OpenMatch) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === match.id) {
          const alreadyJoined = m.playersJoined.some((p) => p.id === activeUser.id);
          if (alreadyJoined) return m;
          return {
            ...m,
            playersJoined: [...m.playersJoined, activeUser],
          };
        }
        return m;
      })
    );
    const newJoinedRecord: JoinedMatchRecord = {
      id: `jm_${Date.now()}`,
      match,
      joinedAt: 'Just now',
      paymentStatus: 'Paid via UPI',
      cost: match.costPerPlayer,
    };
    setJoinedMatches((prev) => [newJoinedRecord, ...prev]);
    showToast(`Joined squad for ${match.title}!`);

    // Sync joined player to Firestore
    try {
      const matchDocRef = doc(db, 'matches', match.id);
      const matchSnap = await getDoc(matchDocRef);
      if (matchSnap.exists()) {
        const existingData = matchSnap.data();
        const existingPlayers: Player[] = existingData.playersJoined || [];
        if (!existingPlayers.some((p) => p.id === activeUser.id)) {
          await updateDoc(matchDocRef, {
            playersJoined: [...existingPlayers, activeUser],
          });
        }
      }
    } catch (e) {
      console.warn('Could not sync joined player to Firestore:', e);
    }
  };

  const handleCreateHostMatch = async (newMatch: OpenMatch) => {
    setMatches((prev) => [newMatch, ...prev]);
    const hostJoinRecord: JoinedMatchRecord = {
      id: `jm_${Date.now()}`,
      match: newMatch,
      joinedAt: 'Just now',
      paymentStatus: 'Paid via UPI',
      cost: newMatch.costPerPlayer,
    };
    setJoinedMatches((prev) => [hostJoinRecord, ...prev]);
    setActiveTab('players');

    // Persist to Firestore so all users in the same location can see and join
    try {
      await setDoc(doc(db, 'matches', newMatch.id), {
        ...newMatch,
        createdAt: serverTimestamp(),
        hostUid: user?.uid || activeUser.id,
      });
    } catch (e) {
      console.warn('Could not save match to Firestore:', e);
    }

    if (newMatch.isLiveNow || newMatch.isLive) {
      showToast(`🔴 LIVE MATCH BROADCASTED! Alerting athletes within 10 km of ${newMatch.venueName}!`);
    } else {
      try {
        const alertResult = await triggerProximityMatchNotifications(newMatch, userProfile);
        if (alertResult.notifiedUsersCount > 0) {
          showToast(`Squad established! 📡 Alerted ${alertResult.notifiedUsersCount} players within 5 km of ${newMatch.area}!`);
        } else {
          showToast(`Squad "${newMatch.title}" published in ${newMatch.city}!`);
        }
      } catch {
        showToast(`Squad "${newMatch.title}" published in ${newMatch.city}!`);
      }
    }
  };

  const handleConfirmRental = (record: GearRentalRecord) => {
    setActiveRentals((prev) => [record, ...prev]);
    showToast(`Borrow request sent to owner! Ref: ${record.rentalRef}`);
  };

  const handleAddNewGear = (item: CommunityGearItem) => {
    setGearItems((prev) => [item, ...prev]);
    showToast(`Your gear "${item.title}" is listed in the community!`);
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookedVenues((prev) => prev.filter((b) => b.id !== bookingId));
    showToast('Turf reservation canceled.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0D1340] text-white shadow-2xl border border-blue-500/40 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-extrabold">{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar with original logo & Indian cities */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCity={selectedCity}
        setSelectedCity={handleCityChange}
        onOpenUserDrawer={() => setIsUserDrawerOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        bookedVenues={bookedVenues}
        joinedMatches={joinedMatches}
        activeRentals={activeRentals}
      />

      {/* Hero Section */}
      <HeroSection
        selectedSport={selectedSport}
        setSelectedSport={setSelectedSport}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedTimeFilter={selectedTimeFilter}
        setSelectedTimeFilter={setSelectedTimeFilter}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Tab / Page Content */}
      <main className="flex-1">
        {activeTab === 'venues' && (
          <VenueBookingSection
            venues={venues}
            selectedSport={selectedSport}
            searchQuery={searchQuery}
            selectedDate={selectedDate}
            selectedCity={selectedCity}
            userCoords={userProfile?.lat && userProfile?.lng ? { lat: userProfile.lat, lng: userProfile.lng } : undefined}
            onSelectVenue={(v) => setBookingVenue(v)}
          />
        )}

        {activeTab === 'players' && (
          <PlayerFinderSection
            matches={matches}
            selectedSport={selectedSport}
            selectedCity={selectedCity}
            userCoords={userProfile?.lat && userProfile?.lng ? { lat: userProfile.lat, lng: userProfile.lng } : undefined}
            onJoinMatch={handleJoinMatch}
            onOpenHostModal={() => {
              setHostModalInitialLive(false);
              setIsHostModalOpen(true);
            }}
            onOpenLiveBroadcastModal={() => {
              setHostModalInitialLive(true);
              setIsHostModalOpen(true);
            }}
            currentUser={activeUser}
          />
        )}

        {activeTab === 'rental' && (
          <SportsRentalSection
            gearItems={gearItems}
            selectedSport={selectedSport}
            selectedCity={selectedCity}
            userCoords={userProfile?.lat && userProfile?.lng ? { lat: userProfile.lat, lng: userProfile.lng } : undefined}
            currentUser={activeUser}
            onConfirmRental={handleConfirmRental}
            onAddNewGear={handleAddNewGear}
          />
        )}
      </main>

      {/* Booking Court Modal */}
      {bookingVenue && (
        <BookingModal
          venue={bookingVenue}
          onClose={() => setBookingVenue(null)}
          onConfirmBooking={handleConfirmCourtBooking}
          onConvertToMatch={() => {
            setIsHostModalOpen(true);
          }}
        />
      )}

      {/* Host an Open Match Modal */}
      {isHostModalOpen && (
        <HostMatchModal
          isOpen={isHostModalOpen}
          venues={venues}
          currentUser={activeUser}
          selectedCity={selectedCity}
          initialIsLive={hostModalInitialLive}
          onClose={() => {
            setIsHostModalOpen(false);
            setHostModalInitialLive(false);
          }}
          onMatchCreated={handleCreateHostMatch}
        />
      )}

      {/* User Activity & Active Reservations Drawer */}
      <UserActivityDrawer
        isOpen={isUserDrawerOpen}
        onClose={() => setIsUserDrawerOpen(false)}
        currentUser={activeUser}
        bookedVenues={bookedVenues}
        joinedMatches={joinedMatches}
        activeRentals={activeRentals}
        onCancelBooking={handleCancelBooking}
      />

      {/* Google Authentication Modal */}
      <AuthModal />

      {/* Athlete Sports Preferences & 5km Radius Onboarding Modal */}
      <SportsOnboardingModal
        currentCity={selectedCity}
        onCityChange={(city) => {
          handleCityChange(city);
          showToast(`Active city switched to ${city}`);
        }}
      />

      {/* 5 km Proximity Match Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectMatch={() => {
          setActiveTab('players');
          setIsNotificationsOpen(false);
          showToast('Navigated to match squads.');
        }}
      />

      {/* Direct Sports Friends Chat Messenger */}
      <ChatMessengerModal />

      {/* Post-Match Teammate Rating Modal */}
      <PlayerRatingModal />

      {/* Refined Player Statistics & Career Analytics Modal */}
      <PlayerStatsModal />

      {/* Pro Athletic Subscription Modal with GPay and Comparison */}
      <ProSubscriptionModal />

      {/* My Own Career Statistics & Endorsements Modal */}
      <MyStatsModal />

      {/* Minimal, Clean Playo-Style Footer */}
      <footer className="bg-[#070B24] text-white border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <SportSyncLogo size="sm" lightText={true} />
              <span className="hidden md:inline-block text-xs text-slate-400 border-l border-white/15 pl-4">
                India's sports network for turfs, matches & gear
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-300 font-semibold">
              <button
                onClick={() => setActiveTab('venues')}
                className="hover:text-blue-400 transition-colors cursor-pointer"
              >
                Turfs & Courts
              </button>
              <button
                onClick={() => setActiveTab('players')}
                className="hover:text-blue-400 transition-colors cursor-pointer"
              >
                Find Squad
              </button>
              <button
                onClick={() => setActiveTab('rental')}
                className="hover:text-blue-400 transition-colors cursor-pointer"
              >
                Community Gear
              </button>
            </div>

            <div className="text-xs text-slate-400">
              © 2026 SportSync
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
