import React, { useState, useMemo } from 'react';
import { OpenMatch, SportType, Player, UserProfile, Venue } from '../types';
import { SportsEquipmentButton } from './SportsEquipmentButton';
import { calculateDistanceKm, getCoordinatesForArea, CITY_DEFAULT_COORDS, INDIAN_AREA_COORDS } from '../lib/geoNotifications';
import {
  Radio,
  MapPin,
  Clock,
  Trophy,
  Users,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Share2,
  Check,
  Sparkles,
  Info,
  Timer,
  Award,
  Zap,
  Flame,
  Plus,
  X,
  AlertCircle,
  Play,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';

interface RadarMatchSectionProps {
  matches: OpenMatch[];
  selectedSport: SportType;
  selectedCity: string;
  userProfile: UserProfile | null;
  currentUser: Player;
  venues?: Venue[];
  onJoinMatch: (match: OpenMatch) => void;
  onOpenHostModal: () => void;
  onCreateNewGame?: (newMatch: OpenMatch) => void;
  onOpenRadarPreferences: () => void;
  onOpenPlayersMap?: () => void;
}

export const RadarMatchSection: React.FC<RadarMatchSectionProps> = ({
  matches,
  selectedSport,
  selectedCity,
  userProfile,
  currentUser,
  venues = [],
  onJoinMatch,
  onOpenHostModal,
  onCreateNewGame,
  onOpenRadarPreferences,
  onOpenPlayersMap,
}) => {
  const [maxRadius, setMaxRadius] = useState<number>(10);
  const [sportFilter, setSportFilter] = useState<SportType>('all');
  const [expandedMatchIds, setExpandedMatchIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreateGameOpen, setIsCreateGameOpen] = useState<boolean>(false);
  const [justLaunchedMatchId, setJustLaunchedMatchId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const { openPlayerStatsModal } = useSocial();

  // Local state for "Make a New Game Right Now" form
  const [newSport, setNewSport] = useState<SportType>('cricket');
  const [newTitle, setNewTitle] = useState<string>('7v7 Box Cricket • Need 2 Batters Right Now!');
  const [venueChoiceType, setVenueChoiceType] = useState<'dropdown' | 'custom'>('dropdown');
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [customVenueName, setCustomVenueName] = useState<string>('');
  const [newCourtName, setNewCourtName] = useState<string>('Pitch A (Main Turf)');
  const [newArea, setNewArea] = useState<string>('');
  const [newLiveStatus, setNewLiveStatus] = useState<string>('⚡ Live on Turf Right Now (Need 2 Immediate Batters/Fielders)');
  const [newLiveScore, setNewLiveScore] = useState<string>('80/3 in 8 ov (Target 110)');
  const [newPlayersNeeded, setNewPlayersNeeded] = useState<number>(2);
  const [newMaxPlayers, setNewMaxPlayers] = useState<number>(7);
  const [newCostPerPlayer, setNewCostPerPlayer] = useState<number>(150);
  const [newGameType, setNewGameType] = useState<string>('Box Cricket 7v7');
  const [newGender, setNewGender] = useState<'Open' | 'Men Only' | 'Women Only' | 'Mixed'>('Open');
  const [newIncludesGear, setNewIncludesGear] = useState<boolean>(true);
  const [newNotes, setNewNotes] = useState<string>('Match currently live on pitch! Heavy tennis balls provided. Join immediately and step onto turf.');
  const [formError, setFormError] = useState<string | null>(null);

  // Available local venues in this city
  const cityVenues = useMemo(() => {
    return venues.filter((v) => !v.city || v.city.toLowerCase() === selectedCity.toLowerCase());
  }, [venues, selectedCity]);

  // Determine user center point for the currently active city
  const cityCenter = CITY_DEFAULT_COORDS[selectedCity] || CITY_DEFAULT_COORDS['Bengaluru'];
  const isProfileInSelectedCity = Boolean(
    userProfile?.city && userProfile.city.toLowerCase() === selectedCity.toLowerCase()
  );

  const userLat = isProfileInSelectedCity && userProfile?.lat
    ? userProfile.lat
    : (isProfileInSelectedCity && userProfile?.area ? getCoordinatesForArea(userProfile.area, selectedCity).lat : cityCenter.lat);

  const userLng = isProfileInSelectedCity && userProfile?.lng
    ? userProfile.lng
    : (isProfileInSelectedCity && userProfile?.area ? getCoordinatesForArea(userProfile.area, selectedCity).lng : cityCenter.lng);

  // Default locality for the selected city
  const defaultAreaForCity = Object.entries(INDIAN_AREA_COORDS).find(([_, d]) => d.city === selectedCity)?.[0] || 'Central Turf Arena';
  const userLocality = isProfileInSelectedCity && userProfile?.area
    ? userProfile.area
    : defaultAreaForCity;

  const userCurrentCity = selectedCity;

  // Initialize newArea with user's locality if empty
  React.useEffect(() => {
    if (!newArea) {
      setNewArea(userLocality);
    }
  }, [userLocality, newArea]);

  // Update presets when user changes sport in the "Make a New Game Right Now" form
  const handleSelectSportForNewGame = (sport: SportType) => {
    setNewSport(sport);
    if (sport === 'cricket') {
      setNewTitle('7v7 Box Cricket • 2nd Innings Underway • Need 2 Batters!');
      setNewCourtName('Box Cricket Pitch 1');
      setNewGameType('Box Cricket 7v7');
      setNewMaxPlayers(7);
      setNewPlayersNeeded(2);
      setNewLiveStatus('⚡ Live on Turf Right Now (2nd Innings in progress)');
      setNewLiveScore('76/3 in 7.4 ov');
      setNewNotes('Match live right now under floodlights! Heavy tennis tape balls provided.');
    } else if (sport === 'football') {
      setNewTitle('5v5 Turf Futsal • 2nd Half (35\') • Need 1 Sub Midfielder!');
      setNewCourtName('AstroTurf Court 1');
      setNewGameType('Turf Futsal 5v5');
      setNewMaxPlayers(5);
      setNewPlayersNeeded(1);
      setNewLiveStatus('⚡ Live on Turf Right Now (2nd Half in progress)');
      setNewLiveScore('Score: 3 - 3 (35\')');
      setNewNotes('Fast-paced turf game. Bibs and match ball provided. Need 1 player right now.');
    } else if (sport === 'badminton') {
      setNewTitle('Doubles Badminton Set 3 (19-17) • Need 1 Player to Sub In');
      setNewCourtName('Indoor Badminton Court 2');
      setNewGameType('Competitive Sets');
      setNewMaxPlayers(4);
      setNewPlayersNeeded(1);
      setNewLiveStatus('⚡ Live on Court Right Now (Deciding 3rd Set 19-17)');
      setNewLiveScore('Set 3: 19 - 17');
      setNewNotes('Playing with Yonex feather shuttles. Non-marking shoes required. Need 1 player immediately.');
    } else if (sport === 'basketball') {
      setNewTitle('3v3 Half-Court Pickup • 4th Quarter Live • Need 1 Player');
      setNewCourtName('Basketball Full Court');
      setNewGameType('Pick-up Game');
      setNewMaxPlayers(6);
      setNewPlayersNeeded(1);
      setNewLiveStatus('⚡ Live on Court Right Now (4th Quarter underway)');
      setNewLiveScore('Game to 21 (Score 17-15)');
      setNewNotes('Spalding official ball on court. Fast-paced pickup game happening right now.');
    } else if (sport === 'tennis') {
      setNewTitle('Singles Tiebreaker & Matchplay • Need 1 Partner on Court');
      setNewCourtName('Championship Tennis Court 1');
      setNewGameType('Competitive Sets');
      setNewMaxPlayers(2);
      setNewPlayersNeeded(1);
      setNewLiveStatus('⚡ Live on Court Right Now (Set 2 Tiebreak)');
      setNewLiveScore('Set 2 (5-5)');
      setNewNotes('Fresh can of Head Tour balls open. Need 1 singles partner right now.');
    }
  };

  const toggleExpand = (matchId: string) => {
    setExpandedMatchIds((prev) => ({
      ...prev,
      [matchId]: !prev[matchId],
    }));
  };

  const handleCopyMatch = (e: React.MouseEvent, match: OpenMatch) => {
    e.stopPropagation();
    const summary = `🔴 LIVE NOW: ${match.title}\n📍 ${match.venueName}, ${match.area} (${match.city})\n⚡ Status: ${match.liveStatus || 'In Progress'}\n👥 Spots: ${match.maxPlayers - match.playersJoined.length} open right now!\n💰 ₹${match.costPerPlayer}/player`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
    }
    setCopiedId(match.id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  // Submit handler for "Make a New Game Right Now"
  const handleCreateLiveGameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Please provide a match title for your live game.');
      return;
    }

    let finalVenueName = '';
    let finalVenueId = '';
    if (venueChoiceType === 'dropdown' && selectedVenueId) {
      const v = cityVenues.find((item) => item.id === selectedVenueId);
      finalVenueName = v ? v.name : 'City Sports Complex';
      finalVenueId = selectedVenueId;
    } else if (customVenueName.trim()) {
      finalVenueName = customVenueName.trim();
      finalVenueId = `ven_custom_${Date.now()}`;
    } else if (cityVenues.length > 0) {
      finalVenueName = cityVenues[0].name;
      finalVenueId = cityVenues[0].id;
    } else {
      finalVenueName = `${userLocality} Sports Turf`;
      finalVenueId = `ven_custom_${Date.now()}`;
    }

    const matchId = `mat_live_${Date.now()}`;
    const newLiveMatch: OpenMatch = {
      id: matchId,
      sport: newSport,
      title: newTitle.trim(),
      venueId: finalVenueId,
      venueName: finalVenueName,
      courtName: newCourtName.trim() || 'Court 1 / Pitch A',
      area: newArea.trim() || userLocality,
      city: selectedCity,
      lat: userLat,
      lng: userLng,
      date: 'Happening Now',
      time: 'Live on Turf Right Now',
      durationMinutes: 90,
      isLive: true,
      liveStatus: newLiveStatus.trim() || 'Live on Turf Right Now • Need players immediately!',
      liveScore: newLiveScore.trim() || undefined,
      emergencyPlayersNeeded: newPlayersNeeded,
      host: currentUser,
      playersJoined: [currentUser],
      maxPlayers: Math.max(newMaxPlayers, newPlayersNeeded + 1),
      skillMin: 3.0,
      skillMax: 4.8,
      skillLabel: 'All Active Athletes',
      costPerPlayer: Number(newCostPerPlayer) || 0,
      gameType: newGameType,
      gender: newGender,
      includesBallsOrShuttles: newIncludesGear,
      notes: newNotes.trim() || 'Game is active right now! Reach the turf directly.',
    };

    if (onCreateNewGame) {
      onCreateNewGame(newLiveMatch);
    } else {
      onOpenHostModal();
    }

    // Auto expand the new match so details are prominently visible
    setExpandedMatchIds((prev) => ({
      ...prev,
      [matchId]: true,
    }));
    setJustLaunchedMatchId(matchId);
    setIsCreateGameOpen(false);
    setFormError(null);
    setSuccessBanner(`⚡ Your game "${newLiveMatch.title}" is LIVE! Athletes within 10 km have received a live match notification.`);
    setTimeout(() => setSuccessBanner(null), 7000);
  };

  // Calculate distance for all matches to user's point
  const matchesWithDistance = matches.map((match) => {
    const mCity = match.city || (match.area.toLowerCase().includes('chandigarh') ? 'Chandigarh' : match.area.toLowerCase().includes('mohali') ? 'Mohali' : selectedCity);
    const mLat = match.lat ?? getCoordinatesForArea(match.area, mCity).lat;
    const mLng = match.lng ?? getCoordinatesForArea(match.area, mCity).lng;
    const distanceKm = Number(calculateDistanceKm(userLat, userLng, mLat, mLng).toFixed(1));
    return {
      ...match,
      city: match.city || mCity,
      lat: mLat,
      lng: mLng,
      calculatedDistance: distanceKm,
    };
  });

  // FILTER: Exclusively show LIVE matches that are actually happening right now!
  // Checks isLive flag, or "Happening Now", or "Live" in date/time.
  const liveMatches = matchesWithDistance.filter((m) => {
    const isActuallyLive = Boolean(
      m.isLive === true ||
      m.date.toLowerCase().includes('happening now') ||
      m.date.toLowerCase().includes('live') ||
      m.time.toLowerCase().includes('live right now') ||
      m.time.toLowerCase().includes('live on turf')
    );

    const effectiveSport = sportFilter !== 'all' ? sportFilter : selectedSport !== 'all' ? selectedSport : 'all';
    const sportMatch = effectiveSport === 'all' || m.sport === effectiveSport;
    const withinRadius = m.calculatedDistance <= maxRadius;

    return isActuallyLive && sportMatch && withinRadius;
  }).sort((a, b) => {
    // Show newly launched match first, then emergency spots, then nearest distance
    if (a.id === justLaunchedMatchId) return -1;
    if (b.id === justLaunchedMatchId) return 1;
    if (a.emergencyPlayersNeeded && !b.emergencyPlayersNeeded) return -1;
    if (!a.emergencyPlayersNeeded && b.emergencyPlayersNeeded) return 1;
    return a.calculatedDistance - b.calculatedDistance;
  });

  return (
    <section
      id="live-matches-happening-now-section"
      className="relative z-20 -mt-4 sm:-mt-6 mb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="bg-gradient-to-br from-[#0B0D1B] via-[#0E1538] to-[#0A1A45] text-white rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-rose-500/30 dark:border-rose-400/40 relative overflow-hidden">
        {/* Pulsating Live Radar Background Rings */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full border border-rose-500/20 pointer-events-none" />
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full border border-rose-500/25 pointer-events-none animate-ping duration-1000" />
        <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full border border-rose-500/10 pointer-events-none" />

        {/* Success Alert Banner */}
        {successBanner && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-spin" />
              <span>{successBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessBanner(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-emerald-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/50 text-rose-300 text-xs font-black tracking-wide uppercase mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>LIVE ON TURF & COURT • HAPPENING RIGHT NOW</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Live Matches Happening Right Now
              <span className="text-xs px-2.5 py-1 rounded-full bg-rose-600 text-white font-black tracking-wider flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                {liveMatches.length} Live Now
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-medium">
              Real-time games currently underway on court or kicking off immediately near{' '}
              <span className="text-white font-bold">{userLocality}, {userCurrentCity}</span>. Sub in right now, fill urgent spots, or launch your own live game!
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* MAKE A NEW GAME RIGHT NOW FEATURE BUTTON */}
            <button
              id="btn-make-game-right-now"
              type="button"
              onClick={() => setIsCreateGameOpen((prev) => !prev)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow-lg active:scale-95 ${
                isCreateGameOpen
                  ? 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-400/50'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black border border-emerald-300/40 hover:shadow-emerald-500/20'
              }`}
            >
              {isCreateGameOpen ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Close Game Form</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current text-slate-950 animate-bounce" />
                  <span>+ Make a New Game Right Now</span>
                </>
              )}
            </button>

            {onOpenPlayersMap && (
              <button
                type="button"
                onClick={onOpenPlayersMap}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 hover:text-white text-xs font-extrabold border border-blue-400/30 transition-all cursor-pointer"
                title="Open Dedicated Active Players Map"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Active Radar Map</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenRadarPreferences}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold border border-white/15 transition-all cursor-pointer"
              title="Change your home locality or coordinates"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{userLocality}</span>
            </button>
          </div>
        </div>

        {/* INLINE FEATURE: "MAKE A NEW GAME RIGHT NOW" CREATION PANEL */}
        {isCreateGameOpen && (
          <div
            id="make-new-game-right-now-panel"
            className="my-5 p-5 sm:p-6 rounded-3xl bg-slate-900/95 border-2 border-emerald-500/40 text-white shadow-2xl animate-fadeIn"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    Make a New Game Right Now
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black">
                      Instant Turf Alert
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Add the details below to alert all athletes in {userLocality}, {selectedCity} immediately!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateGameOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-400/50 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateLiveGameSubmit} className="space-y-4">
              {/* Step 1: Select Sport */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
                  1. Choose Sport
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'cricket', label: '🏏 Cricket' },
                    { id: 'football', label: '⚽ Football' },
                    { id: 'badminton', label: '🏸 Badminton' },
                    { id: 'basketball', label: '🏀 Basketball' },
                    { id: 'tennis', label: '🎾 Tennis' },
                  ].map((sp) => (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => handleSelectSportForNewGame(sp.id as SportType)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all text-center cursor-pointer border ${
                        newSport === sp.id
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-black ring-2 ring-emerald-400/30'
                          : 'bg-white/5 text-slate-200 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Quick Presets */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  2. Quick Fill or Customize Match Title
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {newSport === 'cricket' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setNewTitle('7v7 Box Cricket • Need 2 Batters Right Now!')}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 font-bold border border-white/10 transition-colors"
                      >
                        ⚡ 7v7 Box Cricket (Need 2 Batters)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewTitle('8v8 Tape Ball Night Match • Need 1 Fast Bowler')}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 font-bold border border-white/10 transition-colors"
                      >
                        ⚡ 8v8 Tape Ball (Need Bowler)
                      </button>
                    </>
                  )}
                  {newSport === 'football' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setNewTitle('5v5 Turf Futsal • 2nd Half • Need 1 Midfielder Now')}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 font-bold border border-white/10 transition-colors"
                      >
                        ⚡ 5v5 Turf (Need Midfielder)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewTitle('6v6 Turf Football • Kickoff in 10 mins • Need 2 Players')}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 font-bold border border-white/10 transition-colors"
                      >
                        ⚡ 6v6 Kickoff (Need 2 Players)
                      </button>
                    </>
                  )}
                  {newSport === 'badminton' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setNewTitle('Doubles Badminton Set 3 (19-17) • Need 1 Player Now')}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 font-bold border border-white/10 transition-colors"
                      >
                        ⚡ Doubles Set 3 (Need 1 Sub)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewTitle('Fast Doubles Rally on Court 2 • Need 1 Partner')}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 font-bold border border-white/10 transition-colors"
                      >
                        ⚡ Court 2 Rally (Need Partner)
                      </button>
                    </>
                  )}
                </div>

                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 7v7 Box Cricket • 2nd Innings • Need 2 Players Immediately"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* Step 3: Venue, Court & Locality */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300">Venue / Ground</label>
                    <button
                      type="button"
                      onClick={() => setVenueChoiceType((prev) => (prev === 'dropdown' ? 'custom' : 'dropdown'))}
                      className="text-[10px] text-emerald-400 hover:underline font-bold"
                    >
                      {venueChoiceType === 'dropdown' ? 'Type Custom Ground' : 'Pick from List'}
                    </button>
                  </div>
                  {venueChoiceType === 'dropdown' && cityVenues.length > 0 ? (
                    <select
                      value={selectedVenueId}
                      onChange={(e) => setSelectedVenueId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                    >
                      <option value="" className="text-slate-900">Select Local Venue...</option>
                      {cityVenues.map((v) => (
                        <option key={v.id} value={v.id} className="text-slate-900">
                          {v.name} ({v.area})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={customVenueName}
                      onChange={(e) => setCustomVenueName(e.target.value)}
                      placeholder="e.g. Play Arena Pitch / Sector 42 Turf"
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Court / Pitch Number</label>
                  <input
                    type="text"
                    value={newCourtName}
                    onChange={(e) => setNewCourtName(e.target.value)}
                    placeholder="e.g. Pitch A, Court 2, AstroTurf 1"
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Area / Neighborhood</label>
                  <input
                    type="text"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    placeholder={userLocality}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* Step 4: Live Situation & Players Needed */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Live Status / Situation</label>
                  <select
                    value={newLiveStatus}
                    onChange={(e) => setNewLiveStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="⚡ Live on Turf Right Now (Need Urgent Player/Sub)" className="text-slate-900">
                      ⚡ Live on Turf Right Now (Need Sub)
                    </option>
                    <option value="⏱️ Starting in 5-10 Minutes (Need Players to Kickoff)" className="text-slate-900">
                      ⏱️ Starting in 5-10 Mins (Need Players)
                    </option>
                    <option value="🔥 Warm-up underway on court (Match starting immediately)" className="text-slate-900">
                      🔥 Warm-up underway on court
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Current Score / Phase (Optional)
                  </label>
                  <input
                    type="text"
                    value={newLiveScore}
                    onChange={(e) => setNewLiveScore(e.target.value)}
                    placeholder="e.g. 76/3 (8 ov), 2-1 (Halftime), Set 3"
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    🚨 Players Needed RIGHT NOW
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNewPlayersNeeded(num)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                          newPlayersNeeded === num
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 5: Cost, Total Players & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Cost Per Player (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      value={newCostPerPlayer}
                      onChange={(e) => setNewCostPerPlayer(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                      placeholder="0 for Free / Split"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Total Squad Size (Max Players)
                  </label>
                  <input
                    type="number"
                    value={newMaxPlayers}
                    onChange={(e) => setNewMaxPlayers(Number(e.target.value))}
                    min={2}
                    max={22}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Match Balls / Shuttles
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewIncludesGear((prev) => !prev)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold border text-left flex items-center justify-between ${
                      newIncludesGear
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    <span>{newIncludesGear ? '✅ Balls/Gear Provided' : '⚠️ Bring Own Balls'}</span>
                    <span className="text-[10px] font-black uppercase">Toggle</span>
                  </button>
                </div>
              </div>

              {/* On-Court Host Note */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  On-Court Note / Location Clues for Joining Players
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. We are on Court 2 wearing blue bibs. Come directly to turf!"
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateGameOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  id="btn-submit-live-game-now"
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm hover:from-emerald-400 hover:to-teal-300 shadow-xl active:scale-95 transition-all cursor-pointer"
                >
                  <Flame className="w-4 h-4 fill-current text-slate-950" />
                  <span>Launch Live Game Right Now (Alert 10 km)</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Quick Filter Sub-bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 pb-2">
          {/* Sports Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Sport:</span>
            {[
              { id: 'all', label: 'All Live Sports' },
              { id: 'cricket', label: '🏏 Cricket' },
              { id: 'football', label: '⚽ Football' },
              { id: 'badminton', label: '🏸 Badminton' },
              { id: 'basketball', label: '🏀 Basketball' },
              { id: 'tennis', label: '🎾 Tennis' },
            ].map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => setSportFilter(sp.id as SportType)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  (sportFilter === sp.id || (sportFilter === 'all' && selectedSport === sp.id && sp.id !== 'all'))
                    ? 'bg-rose-600 text-white font-black shadow-xs'
                    : 'bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>

          {/* Radius Selector Switch */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-extrabold">
            <span className="text-[11px] text-slate-400 px-2 font-bold flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-rose-400" />
              Radius:
            </span>
            {[5, 10, 20].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setMaxRadius(r)}
                className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                  maxRadius === r
                    ? 'bg-rose-500 text-white font-black shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>

        {/* Live Matches Grid */}
        {liveMatches.length === 0 ? (
          <div className="my-6 p-8 rounded-3xl bg-white/5 border border-white/10 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 mx-auto mb-3">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-base sm:text-lg font-black text-white">
              No live matches currently underway within {maxRadius} km for this sport
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
              Are you on turf or at the ground right now? Start a new game right here to instantly alert athletes in {userLocality}!
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsCreateGameOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-black shadow-lg transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current text-slate-950" />
                <span>Make a New Game Right Now</span>
              </button>
              {sportFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSportFilter('all')}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
                >
                  View All Live Sports
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
            {liveMatches.slice(0, 9).map((match) => {
              const spotsRemaining = match.maxPlayers - match.playersJoined.length;
              const isJoined = match.playersJoined.some((p) => p.id === currentUser.id);
              const isExpanded = !!expandedMatchIds[match.id];
              const isCopied = copiedId === match.id;
              const percentFilled = Math.min(100, Math.round((match.playersJoined.length / match.maxPlayers) * 100));
              const isJustLaunched = match.id === justLaunchedMatchId;

              return (
                <div
                  key={match.id}
                  id={`live-match-box-${match.id}`}
                  onClick={() => toggleExpand(match.id)}
                  className={`bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between group cursor-pointer relative ${
                    isExpanded
                      ? 'md:col-span-2 lg:col-span-3 border-rose-600 dark:border-rose-500 shadow-2xl ring-4 ring-rose-500/15 dark:ring-rose-400/20 bg-linear-to-b from-white to-rose-50/20 dark:from-slate-900 dark:to-rose-950/20'
                      : 'border-rose-500/30 dark:border-rose-500/40 hover:border-rose-500 hover:shadow-xl hover:-translate-y-1'
                  } ${isJustLaunched ? 'ring-4 ring-emerald-400 border-emerald-500' : ''}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpand(match.id);
                    }
                  }}
                  aria-expanded={isExpanded}
                >
                  <div>
                    {/* Top Pill / Badge Row */}
                    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Glowing Live Badge */}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          <span>LIVE NOW</span>
                        </span>

                        <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider border border-blue-200/60 dark:border-blue-800/60">
                          {match.sport} • {match.gameType}
                        </span>

                        {/* Distance Pill */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black border border-emerald-200/60 dark:border-emerald-800/60">
                          <MapPin className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                          {match.calculatedDistance} km away
                        </span>

                        {isJustLaunched && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">
                            Just Created
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {match.emergencyPlayersNeeded && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
                            <Flame className="w-3 h-3 text-rose-500" />
                            Need {match.emergencyPlayersNeeded} Sub{match.emergencyPlayersNeeded > 1 ? 's' : ''}!
                          </span>
                        )}

                        <span
                          className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            spotsRemaining === 1
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                              : spotsRemaining > 0
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {spotsRemaining > 0 ? `${spotsRemaining} spot${spotsRemaining > 1 ? 's' : ''} left` : 'Full'}
                        </span>

                        {/* Interactive Expand / Collapse Toggle Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
                            isExpanded
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-rose-50 group-hover:text-rose-600 dark:group-hover:bg-rose-950/80 dark:group-hover:text-rose-400'
                          }`}
                        >
                          <span>{isExpanded ? 'Collapse' : 'Details'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Match Title */}
                    <h3 className={`font-black text-[#0D1340] dark:text-white leading-tight ${isExpanded ? 'text-xl sm:text-2xl mb-2' : 'text-base mb-1.5'}`}>
                      {match.title}
                    </h3>

                    {/* Live Status Highlight Strip */}
                    <div className="mb-3 px-3 py-2 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/50 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-200 min-w-0">
                        <Activity className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 animate-pulse" />
                        <span className="truncate">{match.liveStatus || 'Match in progress right now on court!'}</span>
                      </div>
                      {match.liveScore && (
                        <span className="shrink-0 px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[11px] font-black">
                          {match.liveScore}
                        </span>
                      )}
                    </div>

                    {/* Primary Venue & Schedule line */}
                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-3">
                      <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{match.time}</span>
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                          <Timer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>{match.durationMinutes} mins slot</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">
                          <strong className="text-slate-900 dark:text-white">{match.venueName}</strong> — {match.courtName} ({match.area}, {match.city})
                        </span>
                      </div>
                    </div>

                    {/* COLLAPSED VIEW: Quick Host & Roster preview */}
                    {!isExpanded && (
                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 overflow-hidden">
                            {match.playersJoined.slice(0, 4).map((p) => (
                              <img
                                key={p.id}
                                src={p.avatar}
                                alt={p.name}
                                referrerPolicy="no-referrer"
                                title={`${p.name} (${p.levelTitle || 'Player'})`}
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            {match.playersJoined.length}/{match.maxPlayers} on turf
                          </span>
                        </div>

                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/50">
                          {match.includesBallsOrShuttles ? 'Balls Provided' : 'Bring Gear'}
                        </span>
                      </div>
                    )}

                    {/* EXPANDED VIEW: Complete Neat Presentation of All Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-5" onClick={(e) => e.stopPropagation()}>
                        {/* 3-Column Bento Details Dossier */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Column 1: Ground & Match Specifications */}
                          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                              <Trophy className="w-3.5 h-3.5" />
                              Live Turf Specs
                            </div>
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-slate-400 font-medium block text-[11px]">Court / Pitch</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{match.courtName}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium block text-[11px]">Match Format</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{match.gameType}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium block text-[11px]">Equipment / Balls</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {match.includesBallsOrShuttles ? '✅ Match balls / shuttles on court' : '⚠️ Bring own match gear'}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium block text-[11px]">Skill Level</span>
                                <span className="font-bold text-purple-700 dark:text-purple-300">
                                  {match.skillLabel}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Column 2: Squad Host Profile */}
                          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                <Award className="w-3.5 h-3.5" />
                                On-Turf Host
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                                {match.host.reliability || 99}% Reliability
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <img
                                src={match.host.avatar}
                                alt={match.host.name}
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-rose-500"
                              />
                              <div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                                  {match.host.name}
                                </h4>
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                  {match.host.levelTitle || 'Live Host'}
                                </span>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  ⭐ {match.host.rating} • {match.host.matchesPlayed} Matches
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => openPlayerStatsModal(match.host)}
                              className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-600 transition-colors text-center cursor-pointer shadow-2xs"
                            >
                              View Host Profile & Stats
                            </button>
                          </div>

                          {/* Column 3: Live Briefing & Rules */}
                          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2">
                                <Info className="w-3.5 h-3.5" />
                                Live Briefing & Instructions
                              </div>
                              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                                "{match.notes || 'Game is active right now! Reach the turf directly or join via app.'}"
                              </p>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                              <span className="text-slate-400 font-medium">Turf Fee Split:</span>
                              <span className="font-black text-slate-900 dark:text-white">
                                {match.costPerPlayer > 0 ? `₹${match.costPerPlayer} / athlete` : 'Free / Host Covered'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Confirmed Athletes on Turf Section */}
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                Athletes on Turf ({match.playersJoined.length} of {match.maxPlayers} Spots Filled)
                              </span>
                            </div>
                            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5" />
                              {spotsRemaining > 0 ? `${spotsRemaining} spots available right now` : 'Full Squad'}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3.5">
                            <div
                              className="h-full bg-linear-to-r from-rose-500 to-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${percentFilled}%` }}
                            />
                          </div>

                          {/* Athletes Chips Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                            {match.playersJoined.map((player) => (
                              <button
                                key={player.id}
                                type="button"
                                onClick={() => openPlayerStatsModal(player)}
                                className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 hover:border-rose-500 transition-all text-left group/player cursor-pointer"
                                title={`Click to view ${player.name}'s stats`}
                              >
                                <img
                                  src={player.avatar}
                                  alt={player.name}
                                  referrerPolicy="no-referrer"
                                  className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700 group-hover/player:ring-rose-500"
                                />
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover/player:text-rose-600">
                                    {player.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate">
                                    {player.levelTitle || 'Player'}
                                  </div>
                                </div>
                              </button>
                            ))}

                            {/* Vacant spots */}
                            {Array.from({ length: spotsRemaining }).map((_, idx) => (
                              <div
                                key={`vacant-${idx}`}
                                className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-dashed border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-300 text-xs font-bold animate-pulse"
                              >
                                <Zap className="w-3 h-3 text-rose-500" />
                                <span>Spot #{match.playersJoined.length + idx + 1} Open Now</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card bottom action row */}
                  <div
                    className={`mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 ${
                      isExpanded ? 'bg-slate-50 dark:bg-slate-800/40 -mx-5 -mb-5 p-4 rounded-b-3xl border-t border-slate-200 dark:border-slate-800' : ''
                    }`}
                    onClick={(e) => isExpanded && e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Cost Share</span>
                        <span className="text-base sm:text-lg font-black text-[#0D1340] dark:text-white">
                          ₹{match.costPerPlayer}
                          <span className="text-xs font-normal text-slate-400 ml-1">/ player</span>
                        </span>
                      </div>

                      {/* Share Match Button */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyMatch(e, match)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                        title="Copy match details and invite link"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Share</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {isExpanded && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(match.id)}
                          className="px-3 py-2 rounded-xl text-xs font-extrabold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          Minimize
                        </button>
                      )}

                      {isJoined ? (
                        <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          Joined Squad
                        </span>
                      ) : spotsRemaining > 0 ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onJoinMatch(match);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs sm:text-sm font-black shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>Join Live Game Now</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 px-3 py-2">Match Full</span>
                      )}
                    </div>
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
