import React, { useState, useEffect } from 'react';
import { SportType, Venue, Player, OpenMatch } from '../types';
import { useAuth } from '../context/AuthContext';
import { getCoordinatesForArea } from '../lib/geoNotifications';
import { SportsEquipmentButton } from './SportsEquipmentButton';
import { X, Trophy, Radio, Zap, Flame, Clock, Users, ShieldAlert } from 'lucide-react';

interface HostMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  venues: Venue[];
  currentUser: Player;
  onMatchCreated: (match: OpenMatch) => void;
  preselectedVenueId?: string;
  selectedCity?: string;
  initialIsLive?: boolean;
}

export const HostMatchModal: React.FC<HostMatchModalProps> = ({
  isOpen,
  onClose,
  venues,
  currentUser,
  onMatchCreated,
  preselectedVenueId,
  selectedCity = 'Chandigarh',
  initialIsLive = false,
}) => {
  if (!isOpen) return null;

  const { userProfile, user, isPro, setIsProModalOpen } = useAuth();
  
  // Live Match Right Now mode toggle
  const [isLiveNow, setIsLiveNow] = useState<boolean>(initialIsLive);
  const [liveTimingPreset, setLiveTimingPreset] = useState<'now' | '15m' | '30m' | 'custom'>('now');
  const [liveStatusPhrase, setLiveStatusPhrase] = useState('Starting Immediately — Need squad to begin');
  const [emergencyPlayersNeeded, setEmergencyPlayersNeeded] = useState(2);
  const [enableProBroadcast, setEnableProBroadcast] = useState(initialIsLive || isPro);

  // Sync initialIsLive if prop changes
  useEffect(() => {
    if (initialIsLive) {
      setIsLiveNow(true);
      setDate('Today');
      setTime('Starting Immediately (Live)');
      setEnableProBroadcast(true);
    }
  }, [initialIsLive]);

  // Prioritize venues in the active city
  const cityVenues = venues.filter((v) => 
    v.city.toLowerCase().includes(selectedCity.toLowerCase()) || 
    selectedCity.toLowerCase().includes(v.city.toLowerCase())
  );
  const defaultVenue = cityVenues.length > 0 ? cityVenues[0] : venues[0];

  const [sport, setSport] = useState<SportType>('cricket');
  const [title, setTitle] = useState('');
  const [venueId, setVenueId] = useState(preselectedVenueId || defaultVenue?.id || '');
  const [customGroundName, setCustomGroundName] = useState('');
  const [date, setDate] = useState(initialIsLive ? 'Today' : 'Tomorrow');
  const [time, setTime] = useState(initialIsLive ? 'Starting Immediately (Live)' : '07:30 PM – 09:00 PM');
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [costPerPlayer, setCostPerPlayer] = useState(150);
  const [gameType, setGameType] = useState<OpenMatch['gameType']>('Friendly Match');
  const [skillMin, setSkillMin] = useState(3.0);
  const [skillMax, setSkillMax] = useState(4.5);
  const [gender, setGender] = useState<'Mixed' | 'Men Only' | 'Women Only'>('Mixed');
  const [notes, setNotes] = useState('');

  const selectedVenue = venues.find((v) => v.id === venueId);

  const effectiveHost: Player = {
    id: user?.uid || userProfile?.uid || currentUser.id,
    name: userProfile?.displayName || user?.displayName || currentUser.name,
    avatar: userProfile?.photoURL || user?.photoURL || currentUser.avatar,
    rating: currentUser.rating,
    levelTitle: currentUser.levelTitle,
    matchesPlayed: currentUser.matchesPlayed,
    reliability: currentUser.reliability,
    locality: userProfile?.area || currentUser.locality,
  };

  const handleToggleLiveMode = (live: boolean) => {
    setIsLiveNow(live);
    if (live) {
      setDate('Today');
      if (liveTimingPreset === 'now') {
        setTime('Starting Immediately (Live)');
      } else if (liveTimingPreset === '15m') {
        setTime('Starting in 15 mins (Live)');
      } else if (liveTimingPreset === '30m') {
        setTime('Starting in 30 mins (Live)');
      }
      if (!title) {
        setTitle(`🔴 LIVE ${sport.toUpperCase()}: Need ${emergencyPlayersNeeded} Players Right Now!`);
      }
      setEnableProBroadcast(true);
    } else {
      setDate('Tomorrow');
      setTime('07:30 PM – 09:00 PM');
      if (title.startsWith('🔴 LIVE')) {
        setTitle('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const venueCity = selectedVenue?.city || selectedCity;
    const venueArea = selectedVenue?.area || userProfile?.area || 'Local Area';
    const coords = selectedVenue
      ? getCoordinatesForArea(venueArea, venueCity)
      : (userProfile?.lat && userProfile?.lng 
          ? { lat: userProfile.lat, lng: userProfile.lng } 
          : getCoordinatesForArea(venueArea, venueCity));

    const finalVenueName = selectedVenue?.name || customGroundName || `${selectedCity} Community Turf`;

    const computedTitle = title || (
      isLiveNow
        ? `🔴 LIVE ${sport.toUpperCase()}: Urgent Squad at ${finalVenueName}`
        : `${finalVenueName} ${sport.toUpperCase()} Match`
    );

    const matchTime = isLiveNow 
      ? (liveTimingPreset === 'now' 
          ? 'Starting Immediately (Live)' 
          : liveTimingPreset === '15m' 
            ? 'Starting in 15 mins (Live)' 
            : liveTimingPreset === '30m' 
              ? 'Starting in 30 mins (Live)' 
              : time)
      : time;

    const newMatch: OpenMatch = {
      id: `match_${Date.now()}`,
      sport,
      title: computedTitle,
      venueId: selectedVenue?.id || `custom_venue_${Date.now()}`,
      venueName: finalVenueName,
      courtName: selectedVenue?.courts[0]?.name || 'Main Pitch',
      area: venueArea,
      city: venueCity,
      lat: coords.lat,
      lng: coords.lng,
      date: isLiveNow ? 'Today' : date,
      time: matchTime,
      durationMinutes: 90,
      host: effectiveHost,
      playersJoined: [effectiveHost],
      maxPlayers: Number(maxPlayers),
      costPerPlayer: Number(costPerPlayer),
      skillMin,
      skillMax,
      skillLabel: `${skillMin.toFixed(1)} - ${skillMax.toFixed(1)} (Intermediate)`,
      gameType,
      gender,
      isLive: isLiveNow,
      isLiveNow: isLiveNow,
      liveStatus: isLiveNow ? liveStatusPhrase : undefined,
      emergencyPlayersNeeded: isLiveNow ? Number(emergencyPlayersNeeded) : undefined,
      isUrgent: isLiveNow || enableProBroadcast,
      broadcastRadiusKm: isLiveNow ? 10 : 5,
      includesBallsOrShuttles: true,
      notes: notes || (isLiveNow 
        ? '🔴 Urgent: Game ready to start right now. Just show up at turf! UPI split on arrival.'
        : 'Looking for passionate players to complete our squad. UPI split at turf.'),
    };

    onMatchCreated(newMatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-8">
        {/* Header */}
        <div className={`p-5 flex items-center justify-between text-white transition-colors duration-200 ${
          isLiveNow 
            ? 'bg-gradient-to-r from-rose-900 via-rose-800 to-[#0D1340]' 
            : 'bg-[#0D1340]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isLiveNow ? 'bg-rose-500/30 text-rose-300' : 'bg-blue-600/30 text-amber-400'
            }`}>
              {isLiveNow ? <Flame className="w-5 h-5 text-rose-400 animate-pulse" /> : <Trophy className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  {isLiveNow ? 'Broadcast Live Match (Right Now)' : 'Host an Open Match'}
                </h3>
                {isLiveNow && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    LIVE NOW
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                {isLiveNow 
                  ? 'Urgent flash broadcast to athletes in your area starting immediately' 
                  : 'Find players of your skill level to complete your squad'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRIMARY MODE SELECTOR: Live Match Right Now vs Scheduled Ahead */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-2 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => handleToggleLiveMode(true)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isLiveNow
                  ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>⚡ Live Match Right Now</span>
            </button>

            <button
              type="button"
              onClick={() => handleToggleLiveMode(false)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                !isLiveNow
                  ? 'bg-[#0D1340] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>📅 Schedule Upcoming</span>
            </button>
          </div>
        </div>

        {/* Dynamic Proximity / Live Radar Banner */}
        {isLiveNow ? (
          <div className="px-5 py-2.5 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900/50 flex items-center justify-between gap-2 text-xs font-bold text-rose-900 dark:text-rose-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
              <span>
                <strong>10 km Flash Alert:</strong> Matches starting now trigger high-priority alerts to verified {sport} players nearby in {selectedCity}!
              </span>
            </div>
          </div>
        ) : (
          <div className="px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
            <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse shrink-0" />
            <span>
              <strong>10 km Proximity Radar Active:</strong> Athletes who selected <span className="uppercase text-emerald-700 dark:text-emerald-300 font-black">{sport}</span> will be alerted automatically.
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* LIVE MATCH HIGHLIGHT CARD (When isLiveNow is true) */}
          {isLiveNow && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-transparent border-2 border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Live Match Settings (Starts Now)
                </span>
                <span className="text-[11px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                  High Urgency
                </span>
              </div>

              {/* Timing Selection for Live Match */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  When are you playing?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLiveTimingPreset('now');
                      setTime('Starting Immediately (Live)');
                    }}
                    className={`p-2 rounded-xl text-xs font-black text-center transition-all cursor-pointer ${
                      liveTimingPreset === 'now'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-rose-400'
                    }`}
                  >
                    ⚡ Right Now (0m)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLiveTimingPreset('15m');
                      setTime('Starting in 15 mins (Live)');
                    }}
                    className={`p-2 rounded-xl text-xs font-black text-center transition-all cursor-pointer ${
                      liveTimingPreset === '15m'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-rose-400'
                    }`}
                  >
                    ⏱️ In 15 Mins
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLiveTimingPreset('30m');
                      setTime('Starting in 30 mins (Live)');
                    }}
                    className={`p-2 rounded-xl text-xs font-black text-center transition-all cursor-pointer ${
                      liveTimingPreset === '30m'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-rose-400'
                    }`}
                  >
                    ⏱️ In 30 Mins
                  </button>
                </div>
              </div>

              {/* Emergency Players Needed Right Now */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-rose-600" />
                    Players Missing Right Now
                  </label>
                  <select
                    value={emergencyPlayersNeeded}
                    onChange={(e) => setEmergencyPlayersNeeded(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 border border-rose-300 dark:border-rose-800 cursor-pointer"
                  >
                    <option value={1}>1 Player Needed Urgently</option>
                    <option value={2}>2 Players Needed Urgently</option>
                    <option value={3}>3 Players Needed</option>
                    <option value={4}>4+ Players Needed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Live Status Callout
                  </label>
                  <select
                    value={liveStatusPhrase}
                    onChange={(e) => setLiveStatusPhrase(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 border border-rose-300 dark:border-rose-800 cursor-pointer"
                  >
                    <option value="Starting Immediately — Need squad to begin">Starting Immediately — Need squad</option>
                    <option value="Warm-up in progress at turf">Warm-up in progress at turf</option>
                    <option value="Last-minute dropouts — Urgent replacements">Last-minute dropouts (Urgent)</option>
                    <option value="Ready to toss & kick-off">Ready to toss & kick-off</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Sport selection (Strictly 5 sports) */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Sport
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(['cricket', 'football', 'badminton', 'basketball', 'tennis'] as SportType[]).map((sp) => (
                <button
                  type="button"
                  key={sp}
                  onClick={() => {
                    setSport(sp);
                    if (sp === 'cricket') setMaxPlayers(8);
                    else if (sp === 'football') setMaxPlayers(10);
                    else if (sp === 'basketball') setMaxPlayers(6);
                    else setMaxPlayers(4);
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-black capitalize text-center transition-all cursor-pointer ${
                    sport === sp
                      ? (isLiveNow ? 'bg-rose-600 text-white shadow-xs' : 'bg-blue-600 text-white shadow-xs')
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Match Title / Headline
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                isLiveNow
                  ? `🔴 LIVE ${sport.toUpperCase()}: Starting in 15 mins at turf • Need players!`
                  : `e.g. 6v6 Floodlit Box Cricket • Casual & Fun`
              }
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Venue Selection */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Select Turf or Ground Location
            </label>
            <select
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              {cityVenues.length > 0 && (
                <optgroup label={`Courts & Turfs in ${selectedCity}`}>
                  {cityVenues.map((v) => (
                    <option key={v.id} value={v.id} className="dark:bg-slate-800">
                      📍 {v.name} ({v.area})
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Other Options">
                <option value="custom_turf" className="dark:bg-slate-800">
                  + Other Local Ground / Park in {selectedCity}
                </option>
                {venues.filter(v => !cityVenues.some(cv => cv.id === v.id)).map((v) => (
                  <option key={v.id} value={v.id} className="dark:bg-slate-800">
                    {v.name} ({v.area}, {v.city})
                  </option>
                ))}
              </optgroup>
            </select>
            {venueId === 'custom_turf' && (
              <div className="mt-2">
                <input
                  type="text"
                  required
                  value={customGroundName}
                  onChange={(e) => setCustomGroundName(e.target.value)}
                  placeholder={`e.g. Sector 16 Sports Complex / Local Ground, ${selectedCity}`}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>
            )}
          </div>

          {/* Date & Time (Editable for scheduled, locked to Today + instant for live) */}
          {!isLiveNow ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Date
                </label>
                <select
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="Today" className="dark:bg-slate-800">Today</option>
                  <option value="Tomorrow" className="dark:bg-slate-800">Tomorrow</option>
                  <option value="This Friday" className="dark:bg-slate-800">This Friday</option>
                  <option value="This Saturday" className="dark:bg-slate-800">This Saturday</option>
                  <option value="This Sunday" className="dark:bg-slate-800">This Sunday</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Time Slot
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 07:30 PM – 09:00 PM"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          ) : (
            <div className="p-3 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/40 flex items-center justify-between text-xs font-bold text-rose-900 dark:text-rose-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Date: <strong>Today</strong> • Time: <strong>{time}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleLiveMode(false)}
                className="text-xs text-rose-600 dark:text-rose-400 underline font-extrabold cursor-pointer"
              >
                Switch to schedule
              </button>
            </div>
          )}

          {/* Player Capacity & Cost in INR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Total Squad Size
              </label>
              <input
                type="number"
                min={2}
                max={22}
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Cost Per Player (₹)
              </label>
              <input
                type="number"
                min={0}
                max={2000}
                value={costPerPlayer}
                onChange={(e) => setCostPerPlayer(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Game Format
              </label>
              <select
                value={gameType}
                onChange={(e) => setGameType(e.target.value as OpenMatch['gameType'])}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="Friendly Match" className="dark:bg-slate-800">Friendly Match</option>
                <option value="Box Cricket 7v7" className="dark:bg-slate-800">Box Cricket 7v7</option>
                <option value="Turf Futsal 5v5" className="dark:bg-slate-800">Turf Futsal 5v5</option>
                <option value="Competitive Sets" className="dark:bg-slate-800">Competitive Sets</option>
                <option value="Pick-up Game" className="dark:bg-slate-800">Pick-up Game</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Host Notes / Instructions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isLiveNow 
                  ? "e.g. Match starting immediately, we are already at the turf. Bring gear or non-marking shoes!"
                  : "e.g. We have cricket balls and bats. Non-marking shoes compulsory. Google Pay / PhonePe split."
              }
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Pro Match Broadcasting Feature Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-400/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shrink-0">
                PRO
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Priority 10km GPS Broadcast</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase">
                    {isLiveNow ? 'Auto-Active for Live' : 'Paid Feature'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  {isLiveNow 
                    ? 'High-priority radar alert pinging all active players in 10km radius.'
                    : 'Instantly ping matching verified athletes within a 10km radius of your court.'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!isPro) {
                  setIsProModalOpen(true);
                } else {
                  setEnableProBroadcast(!enableProBroadcast);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer shrink-0 ${
                (enableProBroadcast || isLiveNow) && isPro
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-300 hover:text-slate-950'
              }`}
            >
              {isPro
                ? (enableProBroadcast || isLiveNow)
                  ? '✓ Broadcast Active'
                  : '+ Enable Broadcast'
                : 'Unlock (₹99)'}
            </button>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            
            {isLiveNow ? (
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-600/30 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>🔴 Broadcast Live Match Now</span>
              </button>
            ) : (
              <SportsEquipmentButton
                sportIcon="trophy"
                variant="primary"
                size="md"
                type="submit"
              >
                Publish Open Match
              </SportsEquipmentButton>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
