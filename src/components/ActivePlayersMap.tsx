import React, { useState, useMemo } from 'react';
import { ActivePlayerOnMap, SportType, Player } from '../types';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import { calculateDistanceKm, getCoordinatesForArea, CITY_DEFAULT_COORDS, INDIAN_AREA_COORDS } from '../lib/geoNotifications';
import {
  MapPin,
  Compass,
  Radio,
  Users,
  MessageSquare,
  UserPlus,
  Check,
  BarChart3,
  Search,
  Filter,
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Sparkles,
  ShieldCheck,
  Trophy,
  ArrowLeft,
} from 'lucide-react';

interface ActivePlayersMapProps {
  selectedCity: string;
  defaultRadiusKm?: number;
  onOpenHostModal?: () => void;
  onBackToHome?: () => void;
}

export const ActivePlayersMap: React.FC<ActivePlayersMapProps> = ({
  selectedCity,
  defaultRadiusKm = 10,
  onOpenHostModal,
  onBackToHome,
}) => {
  const { userProfile } = useAuth();
  const {
    activePlayers,
    friends,
    addFriend,
    openChatWithPlayer,
    openPlayerStatsModal,
  } = useSocial();

  // Controls & Filters
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(defaultRadiusKm);
  const [selectedSport, setSelectedSport] = useState<SportType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'squad'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<ActivePlayerOnMap | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // User's Center Location aligned with currently active selectedCity
  const userCoords = useMemo(() => {
    const isProfileInSelectedCity = Boolean(
      userProfile?.city && userProfile.city.toLowerCase() === selectedCity.toLowerCase()
    );
    if (isProfileInSelectedCity && userProfile?.lat && userProfile?.lng) {
      return { lat: userProfile.lat, lng: userProfile.lng, area: userProfile.area || 'My Location' };
    }
    const resolved = getCoordinatesForArea('', selectedCity);
    const defaultArea = Object.entries(INDIAN_AREA_COORDS).find(([_, d]) => d.city === selectedCity)?.[0] || selectedCity;
    return {
      lat: resolved.lat,
      lng: resolved.lng,
      area: isProfileInSelectedCity && userProfile?.area ? userProfile.area : defaultArea,
    };
  }, [userProfile, selectedCity]);

  // Calculate distance for all players relative to user coordinates & filter by radius
  const playersWithDistance = useMemo(() => {
    return activePlayers.map((player) => {
      const dist = calculateDistanceKm(userCoords.lat, userCoords.lng, player.lat, player.lng);
      return {
        ...player,
        distanceKm: Number(dist.toFixed(1)),
      };
    });
  }, [activePlayers, userCoords]);

  // Filtered Players within radius and matching filters
  const filteredPlayers = useMemo(() => {
    return playersWithDistance.filter((player) => {
      const withinRadius = (player.distanceKm || 0) <= selectedRadiusKm;
      const matchesSport = selectedSport === 'all' || player.activeSport === selectedSport || player.preferredSports.includes(selectedSport);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'ready' && player.status === 'ready_to_play') ||
        (statusFilter === 'squad' && player.status === 'looking_for_squad');
      const matchesSearch =
        !searchQuery ||
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.locality?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.levelTitle.toLowerCase().includes(searchQuery.toLowerCase());

      return withinRadius && matchesSport && matchesStatus && matchesSearch;
    });
  }, [playersWithDistance, selectedRadiusKm, selectedSport, statusFilter, searchQuery]);

  // Coordinates projected into SVG 600x600 coordinate plane
  // Normalized around userCoords
  const projectToMap = (lat: number, lng: number) => {
    // 1 degree lat is ~111 km. 1 degree lng is ~111*cos(lat) km (~105 km in India)
    const dLatKm = (lat - userCoords.lat) * 111;
    const dLngKm = (lng - userCoords.lng) * 105;

    // Scale km to map pixels based on current radius & zoom
    // Center is (300, 300)
    // Radius ring is 240px representing selectedRadiusKm
    const scale = (220 / selectedRadiusKm) * zoomLevel;
    const x = 300 + dLngKm * scale;
    const y = 300 - dLatKm * scale; // Inverted Y

    // Clamp inside viewbox
    return {
      x: Math.max(30, Math.min(570, x)),
      y: Math.max(30, Math.min(570, y)),
    };
  };

  const getSportEmoji = (sp: SportType) => {
    switch (sp) {
      case 'cricket':
        return '🏏';
      case 'football':
        return '⚽';
      case 'badminton':
        return '🏸';
      case 'basketball':
        return '🏀';
      case 'tennis':
        return '🎾';
      default:
        return '🏆';
    }
  };

  const getStatusColor = (status: ActivePlayerOnMap['status']) => {
    switch (status) {
      case 'ready_to_play':
        return { bg: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', label: 'Ready to Play Now', ring: 'ring-emerald-500' };
      case 'looking_for_squad':
        return { bg: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-400', label: 'Looking for Squad', ring: 'ring-blue-500' };
      case 'warming_up':
        return { bg: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400', label: 'Warming Up', ring: 'ring-amber-500' };
      default:
        return { bg: 'bg-slate-400', text: 'text-slate-600', label: 'Offline', ring: 'ring-slate-400' };
    }
  };

  return (
    <section className="py-8 bg-slate-100/60 dark:bg-slate-950/80 min-h-[calc(100vh-80px)]" id="active-players-map-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb / Return to Homepage */}
        {onBackToHome && (
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-black text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer shadow-xs group"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>← Back to Turfs & Courts Homepage</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>10 km Live Proximity Radar Active</span>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="bg-[#070B24] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-6 border border-white/10">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black uppercase tracking-wider mb-3 border border-blue-400/20">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                Live Radar & Player Proximity
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Active Players Within {selectedRadiusKm} km Radius
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 font-medium">
                Locate athletes currently active, warming up, or seeking teammates around{' '}
                <strong className="text-white underline decoration-emerald-400">{userCoords.area}, {selectedCity}</strong>. Connect, add to friends, or start a direct game chat!
              </p>
            </div>

            {/* Quick Stats Banner */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="text-2xl font-black text-white flex items-center gap-1.5">
                  {filteredPlayers.length}
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Active</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Athletes within {selectedRadiusKm} km radius
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Radar Controls Console */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-800 mb-6 flex flex-col gap-4">
          {/* Row 1: Radius & Sport Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            {/* Radius Selector Pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Radar Radius:
              </span>
              <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {[3, 5, 10, 15, 25].map((rad) => (
                  <button
                    key={rad}
                    onClick={() => setSelectedRadiusKm(rad)}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      selectedRadiusKm === rad
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {rad} km
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Toggle: Map vs List */}
            <div className="flex items-center gap-2">
              <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'map'
                      ? 'bg-[#0D1340] dark:bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Map Radar</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-[#0D1340] dark:bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Player Cards ({filteredPlayers.length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Sports Pills & Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Sports Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {(['all', 'cricket', 'football', 'badminton', 'basketball', 'tennis'] as SportType[]).map((sp) => (
                <button
                  key={sp}
                  onClick={() => setSelectedSport(sp)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    selectedSport === sp
                      ? 'bg-[#0D1340] dark:bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{getSportEmoji(sp)}</span>
                  <span className="capitalize">{sp === 'all' ? 'All Sports' : sp}</span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search athlete or area..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 border border-transparent focus:border-blue-600 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Map & Detail Layout */}
        {viewMode === 'map' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left/Main: Interactive SVG Radar Map Canvas */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-md border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col items-center">
              {/* Map Header overlay */}
              <div className="w-full flex items-center justify-between mb-4 z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                    Live GPS Radar ({userCoords.area})
                  </span>
                </div>

                {/* Zoom & Reset Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2, z + 0.25))}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setZoomLevel(1);
                      setSelectedPlayer(null);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                    title="Reset Center"
                  >
                    <Crosshair className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* The Visual Radar Map Container */}
              <div className="relative w-full max-w-[580px] aspect-square bg-[#070B24] rounded-3xl overflow-hidden border-2 border-slate-800 shadow-inner flex items-center justify-center select-none">
                {/* Grid Overlay */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle, #3b82f6 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                  }}
                />

                {/* Concentric Radar Rings & Crosshairs (SVG) */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 600 600"
                >
                  <defs>
                    <linearGradient id="radarSweep" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Crosshairs */}
                  <line x1="300" y1="20" x2="300" y2="580" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="20" y1="300" x2="580" y2="300" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />

                  {/* Concentric distance circles */}
                  <circle cx="300" cy="300" r="70" stroke="#334155" strokeWidth="1" fill="none" strokeDasharray="3 3" />
                  <text x="305" y="235" fill="#64748b" fontSize="10" fontWeight="bold">{(selectedRadiusKm * 0.3).toFixed(0)} km</text>

                  <circle cx="300" cy="300" r="140" stroke="#334155" strokeWidth="1" fill="none" strokeDasharray="3 3" />
                  <text x="305" y="165" fill="#64748b" fontSize="10" fontWeight="bold">{(selectedRadiusKm * 0.6).toFixed(0)} km</text>

                  {/* Outer set radius limit */}
                  <circle cx="300" cy="300" r="220" stroke="#10b981" strokeWidth="1.5" fill="none" opacity="0.7" />
                  <text x="305" y="85" fill="#10b981" fontSize="11" fontWeight="bold">{selectedRadiusKm} km (Set Limit)</text>

                  {/* Rotating Radar Sweep Beam */}
                  <g className="origin-center animate-[spin_6s_linear_infinite]">
                    <path
                      d="M 300 300 L 300 80 A 220 220 0 0 1 520 300 Z"
                      fill="url(#radarSweep)"
                    />
                  </g>
                </svg>

                {/* Center Pin: You (The Current User) */}
                <div
                  className="absolute z-20 flex flex-col items-center pointer-events-none"
                  style={{ left: '300px', top: '300px', transform: 'translate(-50%, -50%)' }}
                >
                  <div className="relative">
                    <span className="w-8 h-8 rounded-full bg-blue-500/30 absolute -inset-2 animate-ping" />
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center ring-4 ring-blue-400/50 shadow-lg">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded-md bg-blue-900/90 text-blue-200 text-[10px] font-black tracking-wide border border-blue-400/30 shadow-xs whitespace-nowrap">
                    YOU ({userCoords.area})
                  </span>
                </div>

                {/* Plot Active Players Markers */}
                {filteredPlayers.map((player) => {
                  const pos = projectToMap(player.lat, player.lng);
                  const isSelected = selectedPlayer?.id === player.id;
                  const statusInfo = getStatusColor(player.status);
                  const isFriend = friends.some((f) => f.playerId === player.id);

                  return (
                    <div
                      key={player.id}
                      onClick={() => setSelectedPlayer(player)}
                      className="absolute z-30 transition-transform duration-200 cursor-pointer group hover:scale-110 hover:z-40"
                      style={{
                        left: `${pos.x}px`,
                        top: `${pos.y}px`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div className="relative flex flex-col items-center">
                        {/* Player Avatar Pin with glowing status ring */}
                        <div
                          className={`relative rounded-full transition-all ${
                            isSelected
                              ? 'ring-4 ring-amber-400 scale-125 shadow-xl shadow-amber-400/30'
                              : `ring-2 ${statusInfo.ring} shadow-md`
                          }`}
                        >
                          <img
                            src={player.avatar}
                            alt={player.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover bg-slate-800"
                          />

                          {/* Sport emoji badge on corner */}
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-black/80 text-white text-[11px] flex items-center justify-center border border-white/20">
                            {getSportEmoji(player.activeSport)}
                          </span>

                          {/* Friend star badge if already friend */}
                          {isFriend && (
                            <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center">
                              ★
                            </span>
                          )}
                        </div>

                        {/* Player Name and Distance tag */}
                        <div
                          className={`mt-1 px-2 py-0.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 shadow-md whitespace-nowrap ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 scale-105'
                              : 'bg-slate-900/90 text-white border border-slate-700'
                          }`}
                        >
                          <span>{player.name.split(' ')[0]}</span>
                          <span className="text-emerald-400 font-bold">• {player.distanceKm} km</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Map Legend */}
              <div className="mt-4 w-full flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Ready to Play Now</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Looking for Squad</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Warming Up</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400 text-[8px] flex items-center justify-center text-black font-black">★</span>
                  <span>Friend</span>
                </div>
              </div>
            </div>

            {/* Right: Selected Player Detail Panel or Quick Radar List */}
            <div className="lg:col-span-4 space-y-4">
              {selectedPlayer ? (
                /* Selected Player Spotlight Card */
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-lg border-2 border-blue-600/30 dark:border-blue-500/30 animate-in fade-in duration-200">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={selectedPlayer.avatar}
                          alt={selectedPlayer.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500"
                        />
                        <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-black text-white text-xs">
                          {getSportEmoji(selectedPlayer.activeSport)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-black text-slate-900 dark:text-white">
                            {selectedPlayer.name}
                          </h3>
                          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {selectedPlayer.levelTitle}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs">
                          <span className="text-amber-500 font-extrabold">★ {selectedPlayer.rating}</span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {selectedPlayer.distanceKm} km away
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedPlayer(null)}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Status Banner */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 mb-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      <span>{selectedPlayer.statusText}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{selectedPlayer.locality}</span>
                    </div>
                  </div>

                  {/* Quick Stat Highlights */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-center mb-4">
                    <div>
                      <span className="block text-xs font-black text-slate-900 dark:text-white">
                        {selectedPlayer.stats.totalMatchesPlayed}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Matches</span>
                    </div>
                    <div>
                      <span className="block text-xs font-black text-blue-600 dark:text-blue-400">
                        {selectedPlayer.stats.winRatePercentage}%
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Win Rate</span>
                    </div>
                    <div>
                      <span className="block text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {selectedPlayer.reliability}%
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Reliable</span>
                    </div>
                  </div>

                  {/* Action Buttons: Message, Add Friend, View Stats */}
                  <div className="space-y-2">
                    <button
                      onClick={() => openChatWithPlayer(selectedPlayer)}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Direct Message & Match Invite</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => addFriend(selectedPlayer)}
                        disabled={friends.some((f) => f.playerId === selectedPlayer.id)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          friends.some((f) => f.playerId === selectedPlayer.id)
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {friends.some((f) => f.playerId === selectedPlayer.id) ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Friends</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>+ Add Friend</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => openPlayerStatsModal(selectedPlayer)}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Full Stats</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Default List of Nearby Active Players */
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xs border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Nearby Players ({filteredPlayers.length})
                    </h3>
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                      Tap pin or player to view
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                    {filteredPlayers.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 space-y-2">
                        <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="text-xs font-bold">No active players found in this radius</p>
                        <button
                          onClick={() => setSelectedRadiusKm(15)}
                          className="text-xs text-blue-600 dark:text-blue-400 font-extrabold hover:underline"
                        >
                          Expand radius to 15 km
                        </button>
                      </div>
                    ) : (
                      filteredPlayers.map((player) => {
                        const isFriend = friends.some((f) => f.playerId === player.id);
                        return (
                          <div
                            key={player.id}
                            onClick={() => setSelectedPlayer(player)}
                            className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 border border-slate-200/70 dark:border-slate-800 transition-all cursor-pointer flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative shrink-0">
                                <img
                                  src={player.avatar}
                                  alt={player.name}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-xl object-cover"
                                />
                                <span className="absolute -bottom-1 -right-1 text-[10px]">
                                  {getSportEmoji(player.activeSport)}
                                </span>
                              </div>

                              <div className="min-w-0">
                                <div className="text-xs font-black text-slate-900 dark:text-white truncate flex items-center gap-1">
                                  {player.name}
                                  {isFriend && (
                                    <span className="text-[9px] px-1 rounded-sm bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-black">
                                      FRIEND
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                  {player.locality?.split(',')[0]}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                                {player.distanceKm} km
                              </span>
                              <div className="text-[10px] font-bold text-amber-500 mt-0.5">
                                ★ {player.rating}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* List Mode: Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPlayers.map((player) => {
              const statusInfo = getStatusColor(player.status);
              const isFriend = friends.some((f) => f.playerId === player.id);

              return (
                <div
                  key={player.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xs hover:shadow-md border border-slate-200 dark:border-slate-800 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={player.avatar}
                            alt={player.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500"
                          />
                          <span className="absolute -bottom-1 -right-1 text-sm">
                            {getSportEmoji(player.activeSport)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                              {player.name}
                            </h3>
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            {player.levelTitle}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs">
                            <span className="text-amber-500 font-extrabold">★ {player.rating}</span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {player.distanceKm} km away
                            </span>
                          </div>
                        </div>
                      </div>

                      {isFriend && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black">
                          Friend
                        </span>
                      )}
                    </div>

                    {/* Status Box */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 mb-3 space-y-1">
                      <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <Radio className="w-3 h-3 animate-pulse shrink-0" />
                        <span className="line-clamp-1">{player.statusText}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{player.locality}</span>
                      </div>
                    </div>

                    {/* Stats Snippet */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-center mb-3">
                      <div>
                        <span className="block text-xs font-black text-slate-900 dark:text-white">
                          {player.stats.totalMatchesPlayed}
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase font-bold">Matches</span>
                      </div>
                      <div>
                        <span className="block text-xs font-black text-blue-600 dark:text-blue-400">
                          {player.stats.winRatePercentage}%
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase font-bold">Win Rate</span>
                      </div>
                      <div>
                        <span className="block text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {player.reliability}%
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase font-bold">Reliable</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => openChatWithPlayer(player)}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>

                    <button
                      onClick={() => addFriend(player)}
                      disabled={isFriend}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                        isFriend
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isFriend ? '✓' : '+ Friend'}
                    </button>

                    <button
                      onClick={() => openPlayerStatsModal(player)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                      title="View Full Statistics"
                    >
                      <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
