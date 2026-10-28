import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SportType, ActivePlayerOnMap, UserProfile, Player, LivePlayNowBroadcast } from '../types';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import {
  calculateDistanceKm,
  getCoordinatesForArea,
  INDIAN_AREA_COORDS,
  CITY_DEFAULT_COORDS,
  broadcastPlayNowAlert,
  findClosestIndianCity,
} from '../lib/geoNotifications';
import {
  MapPin,
  Compass,
  Radio,
  Users,
  MessageSquare,
  UserPlus,
  Check,
  Search,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Sparkles,
  Zap,
  Bell,
  Navigation,
  ExternalLink,
  ChevronRight,
  Clock,
  ShieldCheck,
  Award,
  Flame,
  Volume2,
  X,
  AlertCircle,
  Share2,
  Crown,
} from 'lucide-react';

interface PlayNowRadarCoreProps {
  selectedCity: string;
  onCityChange?: (city: string) => void;
  initialSport?: SportType;
  onOpenChatWithPlayer?: (player: Player) => void;
}

export const PlayNowRadarCore: React.FC<PlayNowRadarCoreProps> = ({
  selectedCity,
  onCityChange,
  initialSport = 'all',
  onOpenChatWithPlayer,
}) => {
  const { userProfile, user, isPro, setIsProModalOpen } = useAuth();
  const {
    activePlayers,
    friends,
    addFriend,
    openChatWithPlayer,
    openPlayerStatsModal,
  } = useSocial();

  // 1. Sport Selection State: "i can select the sport i want to play right now"
  const [selectedSport, setSelectedSport] = useState<SportType>(initialSport);

  // 2. Location Selection State: "and the location where i want to play"
  const [customArea, setCustomArea] = useState<string>('');
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // 3. Radius Selection State: "within 5-10 km or so"
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(10);

  // Map view mode: Actual Google Maps View vs Athlete Grid List
  const [mapDisplayMode, setMapDisplayMode] = useState<'google_maps' | 'list'>('google_maps');
  const [selectedPlayer, setSelectedPlayer] = useState<ActivePlayerOnMap | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // 4. Notification / Broadcast State:
  // "and a notification is sent to them that this player is at that location playing that certain sport-join them or something like that"
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [activeBroadcast, setActiveBroadcast] = useState<LivePlayNowBroadcast | null>(null);
  const [broadcastNote, setBroadcastNote] = useState<string>('');
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [broadcastAlertSuccess, setBroadcastAlertSuccess] = useState<string | null>(null);
  const [liveResponses, setLiveResponses] = useState<
    Array<{
      id: string;
      playerId: string;
      name: string;
      avatar: string;
      distanceKm: number;
      message: string;
      timestamp: string;
    }>
  >([]);

  // Sound ping synthesizer for broadcast and alerts
  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {}
  };

  // Popular localities for the current city
  const popularLocalities = useMemo(() => {
    return Object.entries(INDIAN_AREA_COORDS)
      .filter(([_, data]) => data.city.toLowerCase() === selectedCity.toLowerCase())
      .map(([areaName]) => areaName);
  }, [selectedCity]);

  // Current target coordinates based on chosen area or userProfile
  const targetLocation = useMemo(() => {
    const areaToResolve =
      customArea.trim() ||
      (userProfile?.city?.toLowerCase() === selectedCity.toLowerCase() && userProfile?.area
        ? userProfile.area
        : popularLocalities[0] || selectedCity);

    const coords = getCoordinatesForArea(areaToResolve, selectedCity);
    return {
      area: areaToResolve,
      city: selectedCity,
      lat: coords.lat,
      lng: coords.lng,
    };
  }, [customArea, userProfile, selectedCity, popularLocalities]);

  // GPS auto-detection
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        const { latitude, longitude } = pos.coords;
        const matched = findClosestIndianCity(latitude, longitude);
        if (onCityChange && matched.city !== selectedCity) {
          onCityChange(matched.city);
        }
        setCustomArea(matched.area);
      },
      (err) => {
        setIsDetectingGps(false);
        setGpsError('Could not retrieve GPS location. You can choose your area below.');
      },
      { timeout: 8000 }
    );
  };

  // Calculate distance for all players relative to current targetLocation
  const playersWithDistance = useMemo(() => {
    return activePlayers.map((player) => {
      const dist = calculateDistanceKm(targetLocation.lat, targetLocation.lng, player.lat, player.lng);
      return {
        ...player,
        distanceKm: Number(dist.toFixed(1)),
      };
    });
  }, [activePlayers, targetLocation]);

  // Filter players by selected sport and radius (within 5-10 km)
  const nearbyAthletes = useMemo(() => {
    return playersWithDistance
      .filter((player) => {
        const withinRadius = (player.distanceKm || 0) <= selectedRadiusKm;
        const matchesSport =
          selectedSport === 'all' ||
          player.activeSport === selectedSport ||
          player.preferredSports.includes(selectedSport);
        return withinRadius && matchesSport;
      })
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [playersWithDistance, selectedRadiusKm, selectedSport]);

  // Handle Broadcast Dispatch
  const handleStartBroadcast = async () => {
    setIsBroadcasting(true);
    setShowBroadcastModal(false);
    playAlertSound();

    const senderProfile = {
      uid: user?.uid || 'guest_user_1',
      displayName: userProfile?.displayName || user?.displayName || 'Sports Athlete',
      photoURL: (userProfile?.photoURL || user?.photoURL) ?? undefined,
    };

    const sportToPlay = selectedSport === 'all' ? 'cricket' : selectedSport;
    const defaultMsg =
      broadcastNote.trim() ||
      `I'm at ${targetLocation.area} ready to play ${sportToPlay.toUpperCase()} right now! Need players to join immediately.`;

    try {
      const result = await broadcastPlayNowAlert({
        sender: senderProfile,
        sport: sportToPlay,
        city: targetLocation.city,
        area: targetLocation.area,
        lat: targetLocation.lat,
        lng: targetLocation.lng,
        radiusKm: selectedRadiusKm,
        customMessage: defaultMsg,
      });

      setActiveBroadcast(result.broadcast);
      setBroadcastAlertSuccess(
        `🚨 Broadcast Live! Alerted ${result.totalNotified} players within ${selectedRadiusKm} km of ${targetLocation.area} playing ${sportToPlay.toUpperCase()}!`
      );

      // Simulate realistic athlete responses after a brief interval
      setTimeout(() => {
        if (result.notifiedPlayers.length > 0) {
          const firstResponder = result.notifiedPlayers[0];
          playAlertSound();
          setLiveResponses((prev) => [
            {
              id: `resp_${Date.now()}_1`,
              playerId: firstResponder.uid,
              name: firstResponder.displayName,
              avatar:
                firstResponder.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
              distanceKm: firstResponder.distanceKm,
              message: `Hey! I'm ${firstResponder.distanceKm} km away with my kit. Joining you right now!`,
              timestamp: 'Just now',
            },
            ...prev,
          ]);
        }
      }, 3500);

      setTimeout(() => {
        if (result.notifiedPlayers.length > 1) {
          const secondResponder = result.notifiedPlayers[1];
          playAlertSound();
          setLiveResponses((prev) => [
            {
              id: `resp_${Date.now()}_2`,
              playerId: secondResponder.uid,
              name: secondResponder.displayName,
              avatar:
                secondResponder.avatar ||
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
              distanceKm: secondResponder.distanceKm,
              message: `Count me in for ${sportToPlay.toUpperCase()}! Reaching in 10-15 mins.`,
              timestamp: 'Just now',
            },
            ...prev,
          ]);
        }
      }, 7000);
    } catch (e) {
      console.error('Broadcast error:', e);
    }
  };

  // Convert lat/lng to SVG 600x600 coordinates
  const projectToMap = (lat: number, lng: number) => {
    const dLatKm = (lat - targetLocation.lat) * 111;
    const dLngKm = (lng - targetLocation.lng) * 105;
    const scale = (220 / selectedRadiusKm) * zoomLevel;
    const x = 300 + dLngKm * scale;
    const y = 300 - dLatKm * scale;

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
        return '⚡';
    }
  };

  const getStatusColor = (status: ActivePlayerOnMap['status']) => {
    switch (status) {
      case 'ready_to_play':
        return { bg: 'bg-emerald-500', text: 'text-emerald-400', label: 'Ready to Play Now', ring: 'ring-emerald-400' };
      case 'looking_for_squad':
        return { bg: 'bg-blue-500', text: 'text-blue-400', label: 'Looking for Squad', ring: 'ring-blue-400' };
      case 'warming_up':
        return { bg: 'bg-amber-500', text: 'text-amber-400', label: 'Warming Up', ring: 'ring-amber-400' };
      default:
        return { bg: 'bg-slate-400', text: 'text-slate-400', label: 'Active in Area', ring: 'ring-slate-400' };
    }
  };

  return (
    <section className="relative overflow-hidden py-8 sm:py-12 bg-slate-900 text-white" id="core-play-now-radar">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Core Feature Title & Hook */}
        <div className="bg-[#070B24] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black tracking-wide mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>CORE FEATURE • INSTANT ATHLETE MATCHING</span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Play Right Now: Find Nearby Players & Alert Them
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
                Select the sport you want to play right now and your location. Instantly discover all athletes within a{' '}
                <span className="text-emerald-400 font-extrabold">{selectedRadiusKm} km radius</span> on Google Maps, and broadcast a direct alert for them to join you on the ground!
              </p>
            </div>

            {/* Live Radar Summary Stats */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-400/30">
                <Radio className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="text-3xl font-black text-white flex items-center gap-2">
                  {nearbyAthletes.length}
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
                    Within {selectedRadiusKm} km
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-medium mt-0.5">
                  Athletes ready for {selectedSport === 'all' ? 'any sport' : selectedSport} in {targetLocation.area}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1 & Step 2 Interactive Command Center */}
        <div className="bg-slate-800/90 rounded-3xl p-5 sm:p-7 border border-slate-700 shadow-xl mb-8 space-y-6">
          {/* STEP 1: SELECT SPORT I WANT TO PLAY RIGHT NOW */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                  Select Sport You Want to Play Right Now
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Active Filter: <strong className="text-emerald-400 capitalize">{selectedSport}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {(
                [
                  { id: 'all', name: 'All Sports', icon: '⚡', desc: 'Any open game' },
                  { id: 'cricket', name: 'Cricket', icon: '🏏', desc: 'Box or Turf Nets' },
                  { id: 'football', name: 'Football', icon: '⚽', desc: '5v5 / 7v7 Turf' },
                  { id: 'badminton', name: 'Badminton', icon: '🏸', desc: 'Indoor Wooden/Synthetic' },
                  { id: 'basketball', name: 'Basketball', icon: '🏀', desc: 'Pickup Hardwood' },
                  { id: 'tennis', name: 'Tennis', icon: '🎾', desc: 'Clay or Hard Court' },
                ] as const
              ).map((item) => {
                const isSelected = selectedSport === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedSport(item.id as SportType)}
                    className={`p-3 rounded-2xl flex flex-col items-start gap-1 transition-all cursor-pointer border text-left ${
                      isSelected
                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30 scale-102 ring-2 ring-blue-300/40'
                        : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:bg-slate-700/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-2xl">{item.icon}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-black mt-1">{item.name}</span>
                    <span className="text-[11px] opacity-75 font-medium leading-tight">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: SELECT LOCATION WHERE I WANT TO PLAY & RADIUS */}
          <div className="pt-4 border-t border-slate-700/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                  Location Where You Want to Play (Within 5-10 km Radius)
                </h3>
              </div>

              {/* Radius Pills: 5km, 10km, 15km */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-blue-400" /> Radius:
                </span>
                <div className="inline-flex p-1 bg-slate-900 rounded-xl border border-slate-700">
                  {[3, 5, 10, 15].map((rad) => (
                    <button
                      key={rad}
                      onClick={() => setSelectedRadiusKm(rad)}
                      className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        selectedRadiusKm === rad
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {rad} km
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Location Selector Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Locality Input / Autocomplete */}
              <div className="md:col-span-8 relative">
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  <input
                    type="text"
                    value={customArea}
                    onChange={(e) => setCustomArea(e.target.value)}
                    placeholder={`Type ground or neighborhood in ${selectedCity} (e.g. ${popularLocalities.slice(0, 2).join(', ')})...`}
                    className="w-full pl-10 pr-28 py-2.5 bg-slate-900 rounded-2xl text-xs sm:text-sm font-semibold text-white placeholder:text-slate-500 border border-slate-700 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleDetectCurrentLocation}
                    disabled={isDetectingGps}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-400/30 text-xs font-black flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Crosshair className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
                    <span>{isDetectingGps ? 'Detecting...' : 'Use GPS'}</span>
                  </button>
                </div>
                {gpsError && (
                  <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {gpsError}
                  </p>
                )}
              </div>

              {/* Broadcast Trigger Call-To-Action Button */}
              <div className="md:col-span-4">
                <button
                  id="broadcast-play-now-btn"
                  onClick={() => {
                    if (!isPro) {
                      setIsProModalOpen(true);
                      return;
                    }
                    setShowBroadcastModal(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102 active:scale-98"
                >
                  <Bell className="w-4 h-4 text-slate-950 animate-bounce" />
                  <span>Broadcast: I'm Playing Right Now!</span>
                  {!isPro && (
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black uppercase flex items-center gap-0.5 ml-1">
                      <Crown className="w-2.5 h-2.5 fill-amber-300" />
                      PRO
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Popular Neighborhood Chips for Quick 1-Click Tap */}
            {popularLocalities.length > 0 && (
              <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap mr-1">
                  Popular Hubs:
                </span>
                {popularLocalities.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setCustomArea(loc)}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors cursor-pointer border ${
                      targetLocation.area.toLowerCase() === loc.toLowerCase()
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                        : 'bg-slate-900/60 text-slate-300 border-slate-700/60 hover:bg-slate-700'
                    }`}
                  >
                    📍 {loc}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Broadcast Banner if user launched one */}
        {activeBroadcast && (
          <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border-2 border-emerald-500 shadow-2xl animate-in slide-in-from-top-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                  <Radio className="w-6 h-6 animate-ping" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                      Live Broadcast Beacon Active
                    </span>
                    <span className="text-xs text-slate-400">
                      Reached {activeBroadcast.notifiedCount} players within {activeBroadcast.radiusKm} km
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-white mt-1">
                    "{activeBroadcast.senderName} is at {activeBroadcast.area} playing {activeBroadcast.sport.toUpperCase()} right now!"
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">{activeBroadcast.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveBroadcast(null);
                    setBroadcastAlertSuccess(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  End Broadcast
                </button>
              </div>
            </div>

            {/* Live Responses Feed from Nearby Athletes */}
            {liveResponses.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Incoming Responses from Nearby Athletes ({liveResponses.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {liveResponses.map((resp) => (
                    <div
                      key={resp.id}
                      className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-emerald-400/30 flex items-center justify-between gap-3 animate-in fade-in"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={resp.avatar}
                          alt={resp.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-emerald-400"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
                            <span>{resp.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/30 text-emerald-300">
                              {resp.distanceKm} km away
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-200 truncate mt-0.5 italic">
                            "{resp.message}"
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (!isPro) {
                            setIsProModalOpen(true);
                            return;
                          }
                          const matchedP = activePlayers.find((p) => p.id === resp.playerId || p.name === resp.name);
                          if (matchedP) {
                            openChatWithPlayer(matchedP);
                          }
                        }}
                        className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shrink-0 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>Chat Now</span>
                        {!isPro && <Crown className="w-2.5 h-2.5 fill-slate-950 inline" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success Toast / Alert Message */}
        {broadcastAlertSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{broadcastAlertSuccess}</span>
            </div>
            <button
              onClick={() => setBroadcastAlertSuccess(null)}
              className="text-emerald-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: ACCURATELY SEE ALL PLAYERS NEAR THAT LOCATION (WITHIN 5-10 KM) ON GOOGLE MAPS */}
        <div className="bg-slate-800 rounded-3xl p-5 sm:p-7 border border-slate-700 shadow-2xl">
          {/* Map Header & View Toggle (Google Maps vs Athlete List) */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                  3
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Live Athlete Discovery & Google Maps Around {targetLocation.area}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Showing {nearbyAthletes.length} active athletes within {selectedRadiusKm} km radius ({targetLocation.city})
              </p>
            </div>

            {/* Display Mode Switcher */}
            <div className="inline-flex p-1 bg-slate-900 rounded-2xl border border-slate-700">
              <button
                id="view-google-maps-btn"
                onClick={() => setMapDisplayMode('google_maps')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  mapDisplayMode === 'google_maps'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>🗺️ Google Maps View</span>
              </button>

              <button
                id="view-athlete-list-btn"
                onClick={() => setMapDisplayMode('list')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  mapDisplayMode === 'list'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>👥 Athlete List ({nearbyAthletes.length})</span>
              </button>
            </div>
          </div>

          {/* GOOGLE MAPS DIRECT VIEW MODE */}
          {mapDisplayMode === 'google_maps' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Google Maps Interactive View & Navigation Controls */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 bg-slate-900/90 p-3 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>
                      Google Maps Coordinates: <strong>{targetLocation.lat.toFixed(4)}, {targetLocation.lng.toFixed(4)}</strong> ({targetLocation.area}, {targetLocation.city})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(targetLocation.area + ' ' + targetLocation.city + ' sports turfs grounds')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Embedded Google Maps Interactive Iframe */}
                <div className="w-full h-[460px] sm:h-[500px] rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl relative bg-slate-950">
                  <iframe
                    title="Google Maps Location View"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://maps.google.com/maps?q=${targetLocation.lat},${targetLocation.lng}&z=14&output=embed`}
                    className="w-full h-full"
                  />

                  {/* Overlaid Floating Athlete Quick Bar */}
                  <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-700 shadow-2xl flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs">
                        {nearbyAthletes.length}
                      </div>
                      <span className="text-xs font-black text-white whitespace-nowrap">
                        Athletes within {selectedRadiusKm}km:
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {nearbyAthletes.map((player) => (
                        <button
                          key={player.id}
                          onClick={() => setSelectedPlayer(player)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border shrink-0 cursor-pointer transition-all ${
                            selectedPlayer?.id === player.id
                              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-105'
                              : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                          }`}
                        >
                          <img src={player.avatar} alt={player.name} className="w-5 h-5 rounded-full object-cover" />
                          <span>{player.name}</span>
                          <span className={selectedPlayer?.id === player.id ? 'text-slate-950 font-black' : 'text-emerald-400 font-extrabold'}>
                            {player.distanceKm} km
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>📍 Real-time Google Maps Ground Coordinates • {targetLocation.area}</span>
                  <span>Click any athlete button to view details & route</span>
                </div>
              </div>

              {/* Right Column: Selected Player Dossier or Athlete Directory */}
              <div className="lg:col-span-4 bg-slate-900/95 rounded-3xl p-5 border border-slate-700 shadow-xl">
                {selectedPlayer ? (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Athlete Dossier</span>
                      </div>
                      <button
                        onClick={() => setSelectedPlayer(null)}
                        className="text-xs text-slate-400 hover:text-white cursor-pointer"
                      >
                        ✕ Close
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={selectedPlayer.avatar}
                        alt={selectedPlayer.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-400"
                      />
                      <div>
                        <h4 className="text-base font-black text-white">{selectedPlayer.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-0.5">
                            ★ {selectedPlayer.rating}
                          </span>
                          <span className="text-xs text-slate-400">• {selectedPlayer.levelTitle}</span>
                        </div>
                        <div className="text-xs font-black text-emerald-400 mt-0.5">
                          📍 {selectedPlayer.distanceKm} km away ({selectedPlayer.currentArea})
                        </div>
                      </div>
                    </div>

                    {/* Status Box */}
                    <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Current Playing Status
                      </div>
                      <p className="text-xs text-slate-200 mt-1 font-medium">"{selectedPlayer.statusText}"</p>
                    </div>

                    {/* Reliability & Matches */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                        <div className="text-lg font-black text-white">{selectedPlayer.reliability}%</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Punctuality</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                        <div className="text-lg font-black text-white">{selectedPlayer.matchesPlayed}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Matches Played</div>
                      </div>
                    </div>

                    {/* Actions with Pro Subscription Gating */}
                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => {
                          if (!isPro) {
                            setIsProModalOpen(true);
                            return;
                          }
                          if (onOpenChatWithPlayer) {
                            onOpenChatWithPlayer(selectedPlayer);
                          } else {
                            openChatWithPlayer(selectedPlayer);
                          }
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Send Direct Game Invite & Chat</span>
                        {!isPro && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase flex items-center gap-0.5 ml-1">
                            <Crown className="w-2.5 h-2.5 fill-slate-950" />
                            PRO
                          </span>
                        )}
                      </button>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlayer.lat},${selectedPlayer.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer"
                      >
                        <Navigation className="w-4 h-4 text-emerald-400" />
                        <span>Navigate via Google Maps</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
                      </a>

                      <button
                        onClick={() => {
                          if (!isPro) {
                            setIsProModalOpen(true);
                            return;
                          }
                          openPlayerStatsModal(selectedPlayer);
                        }}
                        className="w-full py-2 px-4 rounded-xl bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>View Full Athletic Stats & History</span>
                        {!isPro && (
                          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-amber-300 text-[9px] font-black uppercase flex items-center gap-0.5">
                            <Crown className="w-2.5 h-2.5 fill-amber-300" />
                            PRO
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                        Athletes Near {targetLocation.area}
                      </h4>
                      <span className="text-xs font-bold text-emerald-400">
                        {nearbyAthletes.length} found
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                      {nearbyAthletes.length === 0 ? (
                        <div className="py-10 text-center text-slate-400 space-y-2">
                          <Users className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
                          <p className="text-xs font-bold">No athletes within {selectedRadiusKm} km yet</p>
                          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                            Try expanding your radius or click "Broadcast: I'm Playing Right Now!" to alert nearby athletes!
                          </p>
                        </div>
                      ) : (
                        nearbyAthletes.map((player) => (
                          <div
                            key={player.id}
                            onClick={() => setSelectedPlayer(player)}
                            className="p-3 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500 flex items-center justify-between gap-3 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={player.avatar}
                                alt={player.name}
                                className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-600 group-hover:ring-blue-400"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-black text-white truncate flex items-center gap-1">
                                  <span>{player.name}</span>
                                  <span>{getSportEmoji(player.activeSport)}</span>
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">
                                  {player.levelTitle}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-xs font-black text-emerald-400">
                                {player.distanceKm} km
                              </div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold">
                                {player.currentArea.slice(0, 10)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LIST VIEW MODE */}
          {mapDisplayMode === 'list' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyAthletes.map((player) => (
                <div
                  key={player.id}
                  className="bg-slate-900 rounded-2xl p-4 border border-slate-700/80 hover:border-emerald-500 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={player.avatar}
                      alt={player.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-700"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                        <span>{player.name}</span>
                        <span>{getSportEmoji(player.activeSport)}</span>
                      </h4>
                      <div className="text-xs text-slate-400">{player.levelTitle}</div>
                      <div className="text-xs font-black text-emerald-400 mt-1">
                        📍 {player.distanceKm} km away • {player.currentArea}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/80 text-xs text-slate-300 font-medium">
                    "{player.statusText}"
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        if (!isPro) {
                          setIsProModalOpen(true);
                          return;
                        }
                        openChatWithPlayer(player);
                      }}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                      {!isPro && <Crown className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />}
                    </button>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${player.lat},${player.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                      title="Google Maps Navigation"
                    >
                      <Navigation className="w-4 h-4 text-emerald-400" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BROADCAST ALERT MODAL */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-700 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Broadcast Play Right Now</h3>
                  <p className="text-xs text-slate-400">
                    Alert {nearbyAthletes.length} players within {selectedRadiusKm} km of {targetLocation.area}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  Alert Sport
                </label>
                <div className="p-3 rounded-2xl bg-slate-800 text-white text-xs font-black flex items-center gap-2 capitalize">
                  <span>{getSportEmoji(selectedSport)}</span>
                  <span>{selectedSport === 'all' ? 'Cricket / Any Game' : selectedSport}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  Play Location & Proximity
                </label>
                <div className="p-3 rounded-2xl bg-slate-800 text-white text-xs font-black flex items-center justify-between">
                  <span>📍 {targetLocation.area}, {targetLocation.city}</span>
                  <span className="text-emerald-400">{selectedRadiusKm} km Radius</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  Custom Alert Message (Optional)
                </label>
                <textarea
                  value={broadcastNote}
                  onChange={(e) => setBroadcastNote(e.target.value)}
                  placeholder={`e.g. "We are at ${targetLocation.area} pitch right now! Need 2 players immediately. Kit and balls ready."`}
                  rows={3}
                  className="w-full p-3 bg-slate-800 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 border border-slate-700 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleStartBroadcast}
                className="flex-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Radio className="w-4 h-4 text-slate-950 animate-pulse" />
                <span>Transmit Alert Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
