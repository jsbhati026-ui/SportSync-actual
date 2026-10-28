import React, { useState } from 'react';
import { SportSyncLogo } from './SportSyncLogo';
import { CURRENT_USER, CITIES } from '../data/sportsData';
import { VenueBookingRecord, JoinedMatchRecord, GearRentalRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { MapLocationPickerModal } from './MapLocationPickerModal';
import { MapPin, Calendar, ChevronDown, Trophy, ShieldCheck, Share2, Bell, Radio, LogIn, LogOut, Sliders, MessageSquare, Users, Crown, Navigation } from 'lucide-react';

interface NavbarProps {
  activeTab: 'venues' | 'players' | 'rental' | 'map';
  setActiveTab: (tab: 'venues' | 'players' | 'rental' | 'map') => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  onOpenUserDrawer: () => void;
  onOpenNotifications: () => void;
  bookedVenues: VenueBookingRecord[];
  joinedMatches: JoinedMatchRecord[];
  activeRentals: GearRentalRecord[];
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedCity,
  setSelectedCity,
  onOpenUserDrawer,
  onOpenNotifications,
  bookedVenues,
  joinedMatches,
  activeRentals,
}) => {
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const { user, userProfile, unreadNotificationsCount, setIsAuthModalOpen, setIsOnboardingOpen, logout, signInWithGoogle, isLoading, isPro, setIsProModalOpen, setIsMyStatsOpen, updateCity } = useAuth();
  const { openChatWithPlayer, friends } = useSocial();
  const totalActiveBookings = bookedVenues.length + joinedMatches.length + activeRentals.length;

  const handleGoogleSignInClick = async () => {
    try {
      await signInWithGoogle();
    } catch {
      setIsAuthModalOpen(true);
    }
  };

  const handleTabSwitch = (tab: 'venues' | 'players' | 'rental' | 'map') => {
    setActiveTab(tab);
    setTimeout(() => {
      const targetId =
        tab === 'venues'
          ? 'venues-catalog-section'
          : tab === 'players'
          ? 'player-finder-section'
          : 'community-gear-section';
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const displayName = userProfile?.displayName || user?.displayName || CURRENT_USER.name;
  const avatarUrl = userProfile?.photoURL || user?.photoURL || CURRENT_USER.avatar;
  const favoriteSportsCount = userProfile?.favoriteSports?.length || 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors" id="app-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Left: Original SportSync Logo & Indian City Selector */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <button
              onClick={() => handleTabSwitch('venues')}
              className="focus:outline-hidden text-left cursor-pointer"
              title="SportSync India"
            >
              <SportSyncLogo size="md" />
            </button>

            {/* City Selector */}
            <div className="relative">
              <button
                id="city-selector-btn"
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 transition-colors border border-slate-200/70 dark:border-slate-700 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-none">{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-400" />
              </button>

              {cityDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setCityDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 py-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-150 max-h-72 overflow-y-auto">
                    <div className="px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
                      Select City (India)
                    </div>
                    {CITIES.map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          setSelectedCity(city);
                          setCityDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          selectedCity === city
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{city}</span>
                        {selectedCity === city && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Select Exact Location from Map Button */}
            <button
              id="navbar-map-picker-btn"
              onClick={() => setIsMapPickerOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100/80 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold transition-colors cursor-pointer"
              title="Select your exact location from interactive map"
            >
              <Navigation className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>{userProfile?.area || 'Sector 12'} (Pin on Map)</span>
            </button>
          </div>

          {/* Center Navigation Tabs - Clean, Free & Standard Core Features */}
          <nav
            className="hidden md:flex items-center shrink p-0.5 sm:p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 h-9 sm:h-10 my-auto shadow-2xs max-w-fit overflow-hidden"
            id="main-nav-tabs"
          >
            <button
              id="nav-tab-venues"
              onClick={() => handleTabSwitch('venues')}
              className={`flex items-center gap-1.5 px-3 py-1 sm:py-1.5 h-7 sm:h-8 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                activeTab === 'venues'
                  ? 'bg-white dark:bg-slate-900 text-[#0D1340] dark:text-white shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
              <span>Turfs & Courts</span>
            </button>

            <button
              id="nav-tab-players"
              onClick={() => handleTabSwitch('players')}
              className={`flex items-center gap-1.5 px-3 py-1 sm:py-1.5 h-7 sm:h-8 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                activeTab === 'players'
                  ? 'bg-white dark:bg-slate-900 text-[#0D1340] dark:text-white shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Find Squad</span>
            </button>

            <button
              id="nav-tab-rental"
              onClick={() => handleTabSwitch('rental')}
              className={`flex items-center gap-1.5 px-3 py-1 sm:py-1.5 h-7 sm:h-8 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                activeTab === 'rental'
                  ? 'bg-white dark:bg-slate-900 text-[#0D1340] dark:text-white shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Community Gear</span>
            </button>
          </nav>

          {/* Right Action Area: 5km Notifications, Bookings & Google Auth */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Sports Friends & Chat Quick Trigger */}
            <button
              id="sports-chat-btn"
              onClick={() => {
                if (friends.length > 0) {
                  openChatWithPlayer(friends[0] as any);
                } else {
                  onOpenUserDrawer();
                }
              }}
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-slate-200/70 dark:border-slate-700"
              title="Sports Friends Chat"
            >
              <MessageSquare className="w-4 h-4 text-slate-700 dark:text-slate-200" />
              <span className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                {friends.length}
              </span>
            </button>

            {/* 10 km Radius Proximity Notifications Bell */}
            <button
              id="proximity-notifications-btn"
              onClick={onOpenNotifications}
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-slate-200/70 dark:border-slate-700"
              title="10 km Match Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 ? (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-bounce">
                  {unreadNotificationsCount}
                </span>
              ) : (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800" />
              )}
            </button>

            {/* My Activity / Bookings Drawer Toggle */}
            <button
              id="activity-drawer-btn"
              onClick={onOpenUserDrawer}
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-slate-200/70 dark:border-slate-700"
              title="My Bookings & Games"
            >
              <Calendar className="w-4 h-4" />
              {totalActiveBookings > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                  {totalActiveBookings}
                </span>
              )}
            </button>

            {/* Google Authentication / User Profile Button */}
            {user || userProfile ? (
              <div className="relative">
                <button
                  id="user-profile-badge"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 cursor-pointer border border-slate-200/70 dark:border-slate-700 transition-colors"
                >
                  <div className="relative">
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
                  </div>
                  <div className="hidden sm:block text-left leading-tight">
                    <div className="text-xs font-extrabold text-[#0D1340] dark:text-white flex items-center gap-1">
                      {displayName.split(' ')[0]}
                      {isPro ? (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5 fill-slate-950" />
                          PRO
                        </span>
                      ) : (
                        <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400 inline" />
                      )}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      <span>{userProfile?.area || 'Sector 12'}</span>
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-2 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                          {displayName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {userProfile?.email || user?.email || 'Google Player Account'}
                        </div>
                      </div>

                      <button
                        id="my-own-statistics-dropdown-item"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setIsMyStatsOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Trophy className="w-3.5 h-3.5 text-amber-500" />
                          <span>My Athletic Statistics</span>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-black">
                          View Stats
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setIsOnboardingOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>My Sports & 10km Radius</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenUserDrawer();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>My Bookings & Games</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenNotifications();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Bell className="w-3.5 h-3.5 text-amber-500" />
                          <span>10km Match Alerts</span>
                        </span>
                        {unreadNotificationsCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-black">
                            {unreadNotificationsCount}
                          </span>
                        )}
                      </button>

                      {!isPro ? (
                        <button
                          id="upgrade-to-pro-dropdown-btn"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setIsProModalOpen(true);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-black text-amber-800 dark:text-amber-300 bg-amber-100/70 hover:bg-amber-200/80 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 rounded-xl flex items-center justify-between cursor-pointer my-1 border border-amber-300 dark:border-amber-700/60 shadow-xs"
                        >
                          <span className="flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-amber-500" />
                            <span>Upgrade to Pro (₹99)</span>
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black">
                            GPay
                          </span>
                        </button>
                      ) : (
                        <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between my-1">
                          <span className="text-[11px] font-black text-amber-700 dark:text-amber-400 flex items-center gap-1">
                            <Crown className="w-3 h-3 fill-amber-400 text-amber-500" />
                            <span>SportSync Pro Active</span>
                          </span>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">✓ Verified</span>
                        </div>
                      )}

                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  id="sign-in-google-btn"
                  type="button"
                  onClick={handleGoogleSignInClick}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-extrabold text-xs shadow-xs border border-slate-300 dark:border-slate-700 transition-all duration-150 cursor-pointer disabled:opacity-60"
                  title="Sign in to your account"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign In</span>
                </button>

                <button
                  id="register-navbar-btn"
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-1 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-xs transition-all duration-150 cursor-pointer"
                  title="Create new athlete account"
                >
                  <span>Register Free</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Tab Strip */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800 gap-1 overflow-x-auto">
          <button
            onClick={() => handleTabSwitch('venues')}
            className={`flex-1 py-1.5 text-xs font-black rounded-lg text-center cursor-pointer ${
              activeTab === 'venues' ? 'bg-[#0D1340] dark:bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            🏟️ Turfs
          </button>
          <button
            onClick={() => handleTabSwitch('players')}
            className={`flex-1 py-1.5 text-xs font-black rounded-lg text-center cursor-pointer ${
              activeTab === 'players' ? 'bg-purple-700 dark:bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            🏏 Squads
          </button>
          <button
            onClick={() => handleTabSwitch('rental')}
            className={`flex-1 py-1.5 text-xs font-black rounded-lg text-center cursor-pointer ${
              activeTab === 'rental' ? 'bg-emerald-700 dark:bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            🤝 Gear
          </button>
        </div>
      </div>

      {/* Interactive Map Location Picker (Accessible from anywhere in the app) */}
      {isMapPickerOpen && (
        <MapLocationPickerModal
          isOpen={isMapPickerOpen}
          onClose={() => setIsMapPickerOpen(false)}
          initialLat={userProfile?.lat || 30.7620}
          initialLng={userProfile?.lng || 76.7725}
          initialCity={selectedCity}
          initialArea={userProfile?.area || 'Sector 12'}
          onSelectLocation={(loc) => {
            setSelectedCity(loc.city);
            updateCity(loc.city, loc.area, loc.lat, loc.lng);
            setIsMapPickerOpen(false);
          }}
        />
      )}
    </header>
  );
};
