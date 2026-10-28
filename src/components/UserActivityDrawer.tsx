import React, { useState } from 'react';
import { VenueBookingRecord, JoinedMatchRecord, GearRentalRecord, Player } from '../types';
import { ThemeToggle } from './ThemeToggle';
import {
  X,
  Calendar,
  Trophy,
  Share2,
  MapPin,
  QrCode,
  ShieldCheck,
  Users,
  BarChart3,
  Star,
  Award,
  MessageSquare,
  CheckCircle2,
  Clock,
  Zap,
  Mail,
  Sliders,
  LogIn,
  LogOut,
  Radio,
  Sparkles,
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import { CURRENT_USER_DETAILED_STATS } from '../data/activePlayersData';

interface UserActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Player;
  bookedVenues: VenueBookingRecord[];
  joinedMatches: JoinedMatchRecord[];
  activeRentals: GearRentalRecord[];
  onCancelBooking: (bookingId: string) => void;
}

export const UserActivityDrawer: React.FC<UserActivityDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  bookedVenues,
  joinedMatches,
  activeRentals,
  onCancelBooking,
}) => {
  if (!isOpen) return null;

  const [activeSubTab, setActiveSubTab] = useState<'bookings' | 'matches' | 'friends' | 'stats' | 'rentals'>('bookings');
  const [selectedQrPass, setSelectedQrPass] = useState<VenueBookingRecord | null>(null);

  const {
    friends,
    recentTeammates,
    openChatWithPlayer,
    openRatePlayerModal,
    openPlayerStatsModal,
  } = useSocial();

  const {
    user,
    userProfile,
    signInWithGoogle,
    setIsAuthModalOpen,
    setIsOnboardingOpen,
    logout,
  } = useAuth();

  const realName = userProfile?.displayName || user?.displayName || (user?.email ? user.email.split('@')[0] : currentUser.name);
  const realEmail = user?.email || userProfile?.email || null;
  const realAvatar = userProfile?.photoURL || user?.photoURL || currentUser.avatar;
  const realLocality = userProfile?.area && userProfile?.city ? `${userProfile.area}, ${userProfile.city}` : currentUser.locality;
  const favoriteSports = userProfile?.favoriteSports || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-150" id="user-drawer-root">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
        {/* Drawer Header & Player Profile Card */}
        <div className="bg-[#0D1340] text-white p-5">
          <div className="flex items-center justify-between mb-3.5">
            <div className="text-xs font-black uppercase tracking-wider text-blue-400">
              Player Activity & Bookings (India)
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                title="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Details & Profile Space */}
          <div className="rounded-2xl bg-gradient-to-br from-white/[0.13] to-white/[0.06] backdrop-blur-md border border-white/20 p-3.5 shadow-lg space-y-3">
            {/* Top row: Avatar, Real User Info, and Account Status */}
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <img
                  src={realAvatar}
                  alt={realName}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-400 shadow-md"
                />
                {user ? (
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[8px] font-black text-white flex items-center gap-0.5 shadow-xs border border-[#0D1340]">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>VERIFIED</span>
                  </span>
                ) : (
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-[8px] font-black text-white shadow-xs border border-[#0D1340]">
                    GUEST
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div className="text-sm font-black text-white truncate flex items-center gap-1.5">
                    <span className="truncate">{realName}</span>
                    {user && <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />}
                  </div>

                  {user ? (
                    <button
                      onClick={() => logout()}
                      className="text-[10px] font-bold text-slate-300 hover:text-white px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                      title="Log Out of this account"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Log Out</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        signInWithGoogle().catch(() => setIsAuthModalOpen(true));
                      }}
                      className="text-[10px] font-black text-white bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs shrink-0"
                    >
                      <LogIn className="w-3 h-3" />
                      <span>Sign In</span>
                    </button>
                  )}
                </div>

                {/* Real User Email or Status */}
                {realEmail ? (
                  <div className="text-xs text-blue-200/90 font-semibold truncate flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-blue-300 shrink-0" />
                    <span className="truncate">{realEmail}</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-300 font-medium mt-0.5">
                    Sign in with Google to sync your profile
                  </div>
                )}

                {/* Location & Rating Summary */}
                <div className="text-[11px] text-slate-300 flex items-center gap-2 mt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-slate-200 font-bold">
                    <MapPin className="w-3 h-3 text-blue-400" />
                    <span>{realLocality}</span>
                  </span>
                  <span>•</span>
                  <span className="text-emerald-300 font-extrabold">{currentUser.rating} ★ Rating</span>
                  <span>•</span>
                  <span>{bookedVenues.length + joinedMatches.length} Activities</span>
                </div>
              </div>
            </div>

            {/* Bottom row: Sports Preferences Badges & Quick Preferences Action */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
                {favoriteSports.length > 0 ? (
                  favoriteSports.slice(0, 3).map((sport) => (
                    <span
                      key={sport}
                      className="px-2 py-0.5 rounded-md bg-blue-500/25 border border-blue-400/40 text-[10px] font-black text-blue-200 capitalize whitespace-nowrap"
                    >
                      {sport}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-300 font-medium">
                    {user ? 'No favorite sports set' : 'Explore sports'}
                  </span>
                )}
                {favoriteSports.length > 3 && (
                  <span className="text-[10px] font-bold text-blue-300">
                    +{favoriteSports.length - 3}
                  </span>
                )}
              </div>

              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-black transition-colors cursor-pointer shrink-0 border border-white/15"
                title="Edit Sports Interests & 10km Radar"
              >
                <Sliders className="w-3 h-3 text-blue-300" />
                <span>My Sports</span>
              </button>
            </div>
          </div>

          {/* Sub-tabs switch */}
          <div className="grid grid-cols-5 gap-1 mt-4 p-1 rounded-xl bg-black/25">
            <button
              onClick={() => setActiveSubTab('bookings')}
              className={`py-1.5 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                activeSubTab === 'bookings'
                  ? 'bg-white text-[#0D1340]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Turfs</span>
              <span className="text-[9px] px-1 rounded-full bg-blue-500/30">
                {bookedVenues.length}
              </span>
            </button>
            <button
              onClick={() => setActiveSubTab('matches')}
              className={`py-1.5 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                activeSubTab === 'matches'
                  ? 'bg-white text-[#0D1340]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Squads</span>
              <span className="text-[9px] px-1 rounded-full bg-purple-500/30">
                {joinedMatches.length}
              </span>
            </button>
            <button
              onClick={() => setActiveSubTab('friends')}
              className={`py-1.5 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                activeSubTab === 'friends'
                  ? 'bg-white text-[#0D1340]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Friends</span>
              <span className="text-[9px] px-1 rounded-full bg-amber-500/30">
                {friends.length}
              </span>
            </button>
            <button
              onClick={() => setActiveSubTab('stats')}
              className={`py-1.5 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                activeSubTab === 'stats'
                  ? 'bg-white text-[#0D1340]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Stats</span>
            </button>
            <button
              onClick={() => setActiveSubTab('rentals')}
              className={`py-1.5 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                activeSubTab === 'rentals'
                  ? 'bg-white text-[#0D1340]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Gear</span>
              <span className="text-[9px] px-1 rounded-full bg-emerald-500/30">
                {activeRentals.length}
              </span>
            </button>
          </div>
        </div>

        {/* Drawer Body Scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* SubTab 1: Courts Booked */}
          {activeSubTab === 'bookings' && (
            <div className="space-y-3">
              {bookedVenues.length > 0 ? (
                bookedVenues.map((bkg) => (
                  <div
                    key={bkg.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/80 space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                          {bkg.court.name}
                        </span>
                        <h4 className="text-sm font-extrabold text-[#0D1340] dark:text-white">
                          {bkg.venue.name}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                        {bkg.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{bkg.date} • {bkg.slot.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{bkg.venue.area}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="text-xs font-black text-[#0D1340] dark:text-white">
                        ₹{bkg.totalPaid} paid
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedQrPass(bkg)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-extrabold flex items-center gap-1 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/60"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          Show QR Pass
                        </button>
                        <button
                          onClick={() => onCancelBooking(bkg.id)}
                          className="text-[11px] text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No upcoming court bookings</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Explore turfs and nets on the main page.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SubTab 2: Matches Joined & Post-Match Teammate Ratings */}
          {activeSubTab === 'matches' && (
            <div className="space-y-4">
              {/* Post Match Teammates Rating Banner */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-700 dark:text-amber-400">
                    <Award className="w-4 h-4" />
                    <span>Rate Last Match Teammates</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-black">
                    Post-Match
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Rate punctuality and fair play for players from your recent games:
                </p>

                <div className="space-y-2">
                  {recentTeammates.map((teammate) => (
                    <div
                      key={`${teammate.player.id}_${teammate.matchId}`}
                      className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2.5 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={teammate.player.avatar}
                          alt={teammate.player.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {teammate.player.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {teammate.matchDate}
                          </div>
                        </div>
                      </div>

                      {teammate.hasRated ? (
                        <div className="text-right shrink-0">
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Rated ★ {teammate.existingRating?.overallRating || 5}</span>
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => openRatePlayerModal(teammate)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-black text-xs shadow-xs transition-colors cursor-pointer shrink-0"
                        >
                          ★ Rate
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Joined Matches List */}
              <div className="space-y-2.5">
                <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                  Active Joined Squads ({joinedMatches.length})
                </div>

                {joinedMatches.length > 0 ? (
                  joinedMatches.map((jm) => (
                    <div
                      key={jm.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-purple-50/40 dark:bg-purple-950/30 space-y-2 shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 text-[10px] font-black uppercase">
                          {jm.match.sport} Match
                        </span>
                        <span className="text-xs font-black text-purple-900 dark:text-purple-300">
                          ₹{jm.cost}
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold text-[#0D1340] dark:text-white">
                        {jm.match.title}
                      </h4>

                      <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{jm.match.venueName}</span>
                      </div>

                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-purple-100 dark:border-slate-700 text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center justify-between">
                        <span>{jm.match.date}</span>
                        <span>{jm.match.time}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-500 dark:text-slate-400">
                          Squad: {jm.match.playersJoined.length}/{jm.match.maxPlayers} players
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          Spot Reserved
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400">
                    <Trophy className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No open matches joined yet</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Check "Find Squad" or 10km radar to join open games.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SubTab: Friends & Direct Communication */}
          {activeSubTab === 'friends' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Connected Friends ({friends.length})
                </span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                  Tap Chat to connect
                </span>
              </div>

              {friends.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-bold">No sports friends yet</p>
                  <p className="text-[11px]">
                    Open the 10km Active Players Map to discover athletes and connect!
                  </p>
                </div>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-xl object-cover"
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

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {friend.name}
                          </h4>
                          <span className="text-[10px] text-amber-500 font-black shrink-0">
                            ★ {friend.rating}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {friend.levelTitle}
                        </p>
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                          {friend.matchesTogether} matches played together
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openChatWithPlayer(friend as any)}
                        className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                        title="Chat with Friend"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openPlayerStatsModal(friend as any)}
                        className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                        title="View Stats"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SubTab: Refined Player Statistics */}
          {activeSubTab === 'stats' && (
            <div className="space-y-4">
              {/* Total Matches Headline Card */}
              <div className="p-4 rounded-3xl bg-linear-to-br from-blue-600 to-indigo-800 text-white shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-200">
                    Player Performance Record
                  </span>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-white/20">
                    Verified Stats
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div>
                    <span className="text-3xl font-black block">
                      {CURRENT_USER_DETAILED_STATS.totalMatchesPlayed}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-blue-200">
                      Total Matches
                    </span>
                  </div>
                  <div>
                    <span className="text-3xl font-black text-amber-300 block">
                      {CURRENT_USER_DETAILED_STATS.winRatePercentage}%
                    </span>
                    <span className="text-[10px] uppercase font-bold text-blue-200">
                      Win Rate
                    </span>
                  </div>
                  <div>
                    <span className="text-3xl font-black text-emerald-300 block">
                      {CURRENT_USER_DETAILED_STATS.reliabilityPercentage}%
                    </span>
                    <span className="text-[10px] uppercase font-bold text-blue-200">
                      Reliability
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => openPlayerStatsModal(currentUser)}
                  className="w-full py-2 rounded-xl bg-white text-[#0D1340] text-xs font-black flex items-center justify-center gap-1.5 shadow-md hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Open Full Interactive Analytics</span>
                </button>
              </div>

              {/* Sport-wise breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Matches by Sport
                </span>

                {CURRENT_USER_DETAILED_STATS.matchesBySport.length > 0 ? (
                  <div className="space-y-2">
                    {CURRENT_USER_DETAILED_STATS.matchesBySport.map((sp) => (
                      <div
                        key={sp.sport}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="font-extrabold capitalize text-slate-800 dark:text-slate-200">
                          {sp.sport}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                          <strong className="text-slate-900 dark:text-white">{sp.matches}</strong> played ({sp.wins}W - {sp.losses}L)
                        </div>
                        <div className="font-black text-blue-600 dark:text-blue-400">
                          {sp.winRate}% win
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    No verified matches recorded yet.
                  </p>
                )}
              </div>

              {/* Endorsements */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Teammate Badges Earned
                </span>
                {CURRENT_USER_DETAILED_STATS.endorsements.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {CURRENT_USER_DETAILED_STATS.endorsements.map((end) => (
                      <span
                        key={end.tag}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                      >
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{end.tag}</span>
                        <span className="text-blue-600 font-black">+{end.count}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Peer ratings & badges are awarded by other players who play the same match with you.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* SubTab 3: Gear Rentals (P2P Borrowings) */}
          {activeSubTab === 'rentals' && (
            <div className="space-y-3">
              {activeRentals.length > 0 ? (
                activeRentals.map((gr) => (
                  <div
                    key={gr.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 space-y-2 flex items-center gap-3"
                  >
                    <img
                      src={gr.gear.image}
                      alt={gr.gear.title}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {gr.rentalRef}
                        </span>
                        <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
                          {gr.status}
                        </span>
                      </div>
                      <h5 className="text-xs font-extrabold text-[#0D1340] dark:text-white truncate">
                        {gr.gear.title}
                      </h5>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                        Owner: {gr.gear.owner.name} ({gr.gear.owner.locality})
                      </div>
                      <div className="text-xs font-black text-blue-600 dark:text-blue-400 mt-0.5">
                        ₹{gr.totalCost} paid ({gr.durationDays} day{gr.durationDays > 1 ? 's' : ''})
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <Share2 className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No active gear borrowings</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Borrow bats, rackets, or kits from players in your neighborhood.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Digital QR Pass Popup */}
        {selectedQrPass && (
          <div className="absolute inset-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-6 flex flex-col justify-center items-center text-center animate-in zoom-in-95">
            <button
              onClick={() => setSelectedQrPass(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full">
              Turf Entry Pass
            </span>
            <h4 className="text-lg font-black text-[#0D1340] dark:text-white mt-2">
              {selectedQrPass.venue.name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {selectedQrPass.court.name} • {selectedQrPass.slot.time}
            </p>

            <div className="p-3 bg-white rounded-2xl my-4 shadow-sm border-2 border-dashed border-blue-400 dark:border-blue-500">
              <img
                src={selectedQrPass.qrCodeUrl}
                alt="QR Pass"
                referrerPolicy="no-referrer"
                className="w-40 h-40"
              />
            </div>

            <div className="font-mono text-sm font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-lg">
              Pass ID: {selectedQrPass.bookingRef}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Show at turf counter or gate turnstile for fast check-in.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
