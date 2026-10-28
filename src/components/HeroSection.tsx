import React from 'react';
import { SPORT_CATEGORIES } from '../data/sportsData';
import { SportType } from '../types';
import { SportsEquipmentButton } from './SportsEquipmentButton';
import { Search, Clock } from 'lucide-react';

interface HeroSectionProps {
  selectedSport: SportType;
  setSelectedSport: (sport: SportType) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  selectedTimeFilter: string;
  setSelectedTimeFilter: (t: string) => void;
  activeTab: 'venues' | 'players' | 'rental' | 'map';
  setActiveTab: (tab: 'venues' | 'players' | 'rental' | 'map') => void;
  onOpenPlayersMap?: () => void;
}

// Dedicated high-energy sports stock photography for each sport
const SPORT_BACKGROUNDS: Record<
  SportType,
  { url: string; alt: string; badge: string; headline: string; subhead: string }
> = {
  all: {
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=2200&q=85',
    alt: 'Multi-Sport Turf Arena & Stadium Lights',
    badge: 'BOOK COURTS • JOIN SQUADS • SHARE GEAR',
    headline: 'Play Sports.\nAnytime. Anywhere.',
    subhead: 'Instant booking for cricket turfs, football grounds, badminton courts, and neighborhood gear across India.',
  },
  cricket: {
    url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=2200&q=85',
    alt: 'Box Cricket Arena under Floodlights',
    badge: '🏏 BOX CRICKET • TURF NETS • NIGHT MATCHES',
    headline: 'Box Cricket.\nUnder The Lights.',
    subhead: 'Reserve enclosed box cricket pitches, nets with bowling machines, and evening floodlit turfs in your city.',
  },
  football: {
    url: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=2200&q=85',
    alt: 'Lush Green Football Turf & Goalpost under Lights',
    badge: '⚽ 5v5 & 7v7 FOOTBALL TURFS • ASTROTURF',
    headline: 'FIFA Turf.\nKick Off Your Game.',
    subhead: 'Book pristine 5-a-side and 7-a-side AstroTurf grounds with evening floodlights and boot rentals.',
  },
  badminton: {
    url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=2200&q=85',
    alt: 'Indoor Badminton Court with Net and Shuttlecock',
    badge: '🏸 BWF STANDARD WOODEN & SYNTHETIC COURTS',
    headline: 'Fast Rallies.\nNon-Marking Indoor Courts.',
    subhead: 'Yonex and BWF certified indoor badminton courts with shock-absorbing wooden and synthetic mats.',
  },
  basketball: {
    url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=2200&q=85',
    alt: 'Basketball Court and Glass Backboard at Night',
    badge: '🏀 HARDWOOD & OUTDOOR HOOPS • PICKUP RUNS',
    headline: 'Drop Dimes.\nBook Full & Half Courts.',
    subhead: 'Regulation hardwood indoor courts and outdoor acrylic pickup hoops with pro breakaway rims.',
  },
  tennis: {
    url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=2200&q=85',
    alt: 'Championship Tennis Court and Net',
    badge: '🎾 CLAY & HARDCOURT TENNIS • SINGLES & DOUBLES',
    headline: 'Serve & Volley.\nChampionship Courts.',
    subhead: 'Find top-rated clay and plexipave hardcourts with ball machine rentals and floodlit evening slots.',
  },
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  selectedSport,
  setSelectedSport,
  searchQuery,
  setSearchQuery,
  selectedDate,
  setSelectedDate,
  selectedTimeFilter,
  setSelectedTimeFilter,
  activeTab,
  setActiveTab,
  onOpenPlayersMap,
}) => {
  const currentSportConfig = SPORT_BACKGROUNDS[selectedSport] || SPORT_BACKGROUNDS.all;

  // Equipment icon matching the current sport
  const currentEquipmentIcon =
    selectedSport === 'cricket'
      ? 'cricket'
      : selectedSport === 'football'
      ? 'football'
      : selectedSport === 'badminton'
      ? 'badminton'
      : selectedSport === 'basketball'
      ? 'basketball'
      : selectedSport === 'tennis'
      ? 'tennis'
      : 'trophy';

  return (
    <section className="relative overflow-hidden bg-[#070B24] text-white" id="sportsync-hero">
      {/* Background Image Container with Smooth Crossfade for each sport */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {(Object.keys(SPORT_BACKGROUNDS) as SportType[]).map((sportKey) => {
          const config = SPORT_BACKGROUNDS[sportKey];
          const isActive = selectedSport === sportKey;

          return (
            <div
              key={sportKey}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-60' : 'opacity-0'
              }`}
            >
              <img
                src={config.url}
                alt={config.alt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center scale-105"
              />
            </div>
          );
        })}

        {/* Dynamic Dark Gradients to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070B24] via-[#070B24]/80 to-[#070B24]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070B24] via-transparent to-[#070B24]/70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-10 sm:pb-12">
        {/* Playo-Inspired Clean & Bold Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black tracking-wide mb-3 transition-all duration-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {currentSportConfig.badge}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white whitespace-pre-line transition-all duration-300">
            {currentSportConfig.headline}
          </h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-slate-200 max-w-lg font-medium leading-relaxed drop-shadow-xs transition-all duration-300">
            {currentSportConfig.subhead}
          </p>

          {/* Direct Focus CTA: Find Squad / Live Matches & Book Courts */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setActiveTab('players');
                setTimeout(() => {
                  const el = document.getElementById('player-finder-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    window.scrollTo({ top: 480, behavior: 'smooth' });
                  }
                }, 60);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 hover:scale-102 transition-all cursor-pointer group"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping" />
              <span>⚡ Find Squad & Matches</span>
              <span className="text-xs bg-slate-950/20 px-2 py-0.5 rounded-md font-extrabold group-hover:translate-x-0.5 transition-transform">
                Join Players →
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('venues');
                setTimeout(() => {
                  const el = document.getElementById('venues-catalog-section') || document.getElementById('hero-search-console');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    window.scrollTo({ top: 480, behavior: 'smooth' });
                  }
                }, 60);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-600/25 border border-blue-400/30 hover:scale-102 transition-all cursor-pointer group"
            >
              <span>🏟️ Book Turfs & Courts</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md font-extrabold group-hover:translate-x-0.5 transition-transform">
                Explore Venues →
              </span>
            </button>
          </div>
        </div>

        {/* 5 Core Sports Pills - Click changes background photo dynamically */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" id="hero-sport-pills">
          {SPORT_CATEGORIES.map((cat) => {
            const isSelected = selectedSport === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedSport(cat.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 cursor-pointer shadow-xs ${
                  isSelected
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400/50 shadow-md shadow-blue-600/30 scale-102'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/15 backdrop-blur-xs'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-black/40 text-slate-300'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Clean, Neat Search Bar Card (Playo-Style) - Positioned down at the base */}
        <div
          className={`mt-8 sm:mt-12 p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl border border-white/20 dark:border-slate-800 transition-all duration-300 ${
            activeTab !== 'venues' ? 'hidden' : 'block'
          }`}
          id="hero-search-console"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="lg:col-span-5 relative">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Turf, Ground, or Area
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Sarjapur, Whitefield, Box Cricket, Siri Fort..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-600 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Date Quick Selector */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Date
              </label>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                {['Today', 'Tomorrow', 'Weekend'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(d)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer ${
                      selectedDate === d
                        ? 'bg-white dark:bg-slate-700 text-[#0D1340] dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Preference */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedTimeFilter}
                  onChange={(e) => setSelectedTimeFilter(e.target.value)}
                  className="w-full pl-8 pr-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600 border border-slate-200 dark:border-slate-700 appearance-none cursor-pointer"
                >
                  <option value="all">Any Time</option>
                  <option value="morning">Morning</option>
                  <option value="evening">Evening Prime</option>
                  <option value="night">Night Slots</option>
                </select>
              </div>
            </div>

            {/* Find Action */}
            <div className="lg:col-span-2 pt-1 sm:pt-0">
              <label className="hidden lg:block text-[11px] font-black uppercase tracking-wider text-transparent mb-1">
                Search
              </label>
              <SportsEquipmentButton
                id="hero-explore-btn"
                sportIcon={currentEquipmentIcon}
                variant="primary"
                size="md"
                className="w-full h-10"
                onClick={() => {
                  if (activeTab !== 'venues') setActiveTab('venues');
                  const el = document.getElementById('venues-catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Search Slots
              </SportsEquipmentButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
