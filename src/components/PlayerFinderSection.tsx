import React, { useState } from 'react';
import { OpenMatch, SportType, Player } from '../types';
import { SportsEquipmentButton } from './SportsEquipmentButton';
import { Trophy, MapPin, Calendar, Clock, Users, Plus, CheckCircle2, BarChart3, Radio, ChevronDown, ChevronUp, Share2, Shield, Sparkles, AlertCircle, Crown, Zap, Flame } from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import { isItemInLocation, TRICITY_CITIES } from '../lib/geoNotifications';

interface PlayerFinderSectionProps {
  matches: OpenMatch[];
  selectedSport: SportType;
  onJoinMatch: (match: OpenMatch) => void;
  onOpenHostModal: () => void;
  onOpenLiveBroadcastModal?: () => void;
  currentUser: Player;
  onOpenPlayersMap?: () => void;
  selectedCity: string;
  userCoords?: { lat: number; lng: number };
}

export const PlayerFinderSection: React.FC<PlayerFinderSectionProps> = ({
  matches,
  selectedSport,
  onJoinMatch,
  onOpenHostModal,
  onOpenLiveBroadcastModal,
  currentUser,
  onOpenPlayersMap,
  selectedCity,
  userCoords,
}) => {
  const [levelFilter, setLevelFilter] = useState<'all' | 'intermediate' | 'advanced'>('all');
  const [liveModeFilter, setLiveModeFilter] = useState<'all' | 'live' | 'upcoming'>('all');
  const [expandedMatchIds, setExpandedMatchIds] = useState<Record<string, boolean>>({});
  const [copiedMatchId, setCopiedMatchId] = useState<string | null>(null);
  const { openPlayerStatsModal } = useSocial();
  const { isPro, setIsProModalOpen } = useAuth();

  const toggleExpand = (matchId: string) => {
    setExpandedMatchIds((prev) => ({
      ...prev,
      [matchId]: !prev[matchId],
    }));
  };

  const handleCopyMatch = (e: React.MouseEvent, match: OpenMatch) => {
    e.stopPropagation();
    const liveTag = (match.isLive || match.isLiveNow) ? '🔴 LIVE NOW! ' : '';
    const summary = `${liveTag}🏆 SportsSync Match: ${match.title}\n📅 ${match.date} at ${match.time}\n📍 ${match.venueName}, ${match.area}\n⚽ Sport: ${match.sport.toUpperCase()} (${match.gameType})\n👥 ${match.playersJoined.length}/${match.maxPlayers} joined • ₹${match.costPerPlayer}/player\nJoin squad on SportsSync!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
    }
    setCopiedMatchId(match.id);
    setTimeout(() => setCopiedMatchId(null), 2200);
  };

  const isTricity = TRICITY_CITIES.includes(selectedCity);

  const filteredMatches = matches
    .filter((m) => {
      // 1. Location match (city, metro or proximity coordinates)
      const matchesLocation = isItemInLocation(
        { city: m.city, area: m.area, lat: m.lat, lng: m.lng },
        selectedCity,
        userCoords?.lat,
        userCoords?.lng,
        35
      );

      const sportMatch = selectedSport === 'all' || m.sport === selectedSport;
      const levelMatch =
        levelFilter === 'all' ||
        (levelFilter === 'intermediate' && m.skillMin <= 3.8) ||
        (levelFilter === 'advanced' && m.skillMin >= 4.0);

      const liveMatch =
        liveModeFilter === 'all' ||
        (liveModeFilter === 'live' && (m.isLive || m.isLiveNow)) ||
        (liveModeFilter === 'upcoming' && !m.isLive && !m.isLiveNow);

      return matchesLocation && sportMatch && levelMatch && liveMatch;
    })
    .sort((a, b) => {
      // Prioritize Live matches at the top of the feed
      const aLive = a.isLive || a.isLiveNow ? 1 : 0;
      const bLive = b.isLive || b.isLiveNow ? 1 : 0;
      return bLive - aLive;
    });

  return (
    <section className="py-8 sm:py-12 bg-slate-100/60" id="player-finder-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Header with Host Match CTA */}
        <div className="bg-[#0D1340] rounded-2xl p-5 sm:p-7 text-white shadow-lg mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black uppercase tracking-wider mb-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Community Matchmaking
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              Need Players for Your Game?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 font-medium">
              Join local open matches or host one to find squad members at your local turf. Split turf fees easily via UPI.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              id="broadcast-live-squad-btn"
              onClick={() => {
                if (!isPro) {
                  setIsProModalOpen(true);
                } else if (onOpenLiveBroadcastModal) {
                  onOpenLiveBroadcastModal();
                } else {
                  onOpenHostModal();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-black text-xs transition-all cursor-pointer shadow-md hover:scale-[1.02] border border-rose-400/40"
              title="Broadcast a live match starting right now with urgent 10km radar"
            >
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300 animate-pulse" />
              <span>⚡ Live Match Right Now</span>
            </button>

            <button
              id="broadcast-squad-btn"
              onClick={() => {
                if (!isPro) {
                  setIsProModalOpen(true);
                } else if (onOpenLiveBroadcastModal) {
                  onOpenLiveBroadcastModal();
                } else {
                  onOpenHostModal();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-sm"
              title="Broadcast match to players within 10km"
            >
              <Crown className="w-4 h-4 fill-slate-950" />
              <span>Broadcast Match (Pro)</span>
            </button>

            <SportsEquipmentButton
              id="host-open-match-btn"
              sportIcon="trophy"
              variant="accent"
              size="md"
              onClick={onOpenHostModal}
            >
              + Host Match
            </SportsEquipmentButton>
          </div>
        </div>

        {/* Clean Filter Row with Live Mode Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 text-xs font-black">
              <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{selectedCity} {isTricity ? '(Tricity)' : ''}</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px]">
                {filteredMatches.length} Squads
              </span>
            </div>

            {/* Live Mode Switcher */}
            <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
              <button
                onClick={() => setLiveModeFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  liveModeFilter === 'all'
                    ? 'bg-[#0D1340] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setLiveModeFilter('live')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  liveModeFilter === 'live'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>🔴 Live Now</span>
              </button>
              <button
                onClick={() => setLiveModeFilter('upcoming')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  liveModeFilter === 'upcoming'
                    ? 'bg-[#0D1340] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Upcoming
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">Level:</span>
            <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
              <button
                onClick={() => setLevelFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  levelFilter === 'all'
                    ? 'bg-[#0D1340] dark:bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Levels
              </button>
              <button
                onClick={() => setLevelFilter('intermediate')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  levelFilter === 'intermediate'
                    ? 'bg-[#0D1340] dark:bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Intermediate
              </button>
              <button
                onClick={() => setLevelFilter('advanced')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  levelFilter === 'advanced'
                    ? 'bg-[#0D1340] dark:bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Advanced
              </button>
            </div>
          </div>
        </div>

        {/* Matches Feed Grid or Empty State */}
        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" id="matches-feed-list">
            {filteredMatches.map((match) => {
              const spotsRemaining = match.maxPlayers - match.playersJoined.length;
              const isUserJoined = match.playersJoined.some((p) => p.id === currentUser.id);
              const isExpanded = Boolean(expandedMatchIds[match.id]);
              const isLive = Boolean(match.isLive || match.isLiveNow);

              return (
                <div
                  key={match.id}
                  onClick={() => toggleExpand(match.id)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpand(match.id);
                    }
                  }}
                  className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between cursor-pointer text-left focus:outline-hidden focus:ring-2 ${
                    isLive
                      ? 'bg-gradient-to-b from-rose-50/40 via-white to-white dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900 border-rose-300 dark:border-rose-900/60 shadow-md ring-1 ring-rose-500/20'
                      : isExpanded
                        ? 'bg-white dark:bg-slate-900 border-blue-500/80 dark:border-blue-500/80 shadow-xl ring-2 ring-blue-500/15'
                        : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800'
                  }`}
                  id={`match-card-${match.id}`}
                >
                  {/* Card Top: Sport Badge + Spots Alert + LIVE Pulse */}
                  <div>
                    {isLive && (
                      <div className="mb-3 px-3 py-1.5 rounded-xl bg-rose-600 text-white flex items-center justify-between text-xs font-black shadow-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                          <span>🔴 LIVE RIGHT NOW • {match.liveStatus || 'Starting Immediately'}</span>
                        </div>
                        {match.emergencyPlayersNeeded && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-300 text-slate-950 text-[10px] font-black uppercase">
                            Urgent: {match.emergencyPlayersNeeded} Needed
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider border border-blue-200/60 dark:border-blue-900/50">
                          {match.sport} • {match.gameType}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                          {match.gender}
                        </span>
                        {match.isUrgent && !isLive && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black">
                            PRO BROADCAST
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Spots Indicator Badge */}
                        <div
                          className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                            spotsRemaining === 1
                              ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                              : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400'
                          }`}
                        >
                          {spotsRemaining > 0 ? `${spotsRemaining} spot${spotsRemaining > 1 ? 's' : ''} left` : 'Match Full'}
                        </div>

                        {/* Details Toggle Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(match.id);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title={isExpanded ? 'Collapse match details' : 'Expand full lineup and details'}
                        >
                          <span>{isExpanded ? 'Collapse' : 'Details'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                        </button>
                      </div>
                    </div>

                    {/* Match Title */}
                    <h3 className="text-base sm:text-lg font-black text-[#0D1340] dark:text-white leading-snug">
                      {match.title}
                    </h3>

                    {/* Date, Time & Venue */}
                    <div className="mt-2.5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{match.date}</span>
                        <span className="text-slate-400 dark:text-slate-600">•</span>
                        <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-1" />
                        <span>{match.time} ({match.durationMinutes} mins)</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{match.venueName} — {match.area}</span>
                      </div>
                    </div>

                    {/* Host and Players Avatar Stack */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2 overflow-hidden">
                          {match.playersJoined.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openPlayerStatsModal(p);
                              }}
                              className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover cursor-pointer hover:scale-110 hover:z-10 transition-transform"
                              title={`View ${p.name}'s performance & stats`}
                            >
                              <img
                                src={p.avatar}
                                alt={p.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full rounded-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                        <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          {match.playersJoined.length}/{match.maxPlayers} Players
                        </span>
                      </div>

                      <div className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md">
                        {match.skillLabel}
                      </div>
                    </div>

                    {match.notes && (
                      <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl italic">
                        "{match.notes}"
                      </p>
                    )}
                  </div>

                  {/* EXPANDABLE SECTION: Full Squad Lineup, Match Logistics & Rules */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
                      {/* Teammates Lineup List */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            Confirmed Squad Lineup ({match.playersJoined.length}/{match.maxPlayers})
                          </h4>
                          <span className="text-[10px] text-slate-400 font-semibold">Click player for bio</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {match.playersJoined.map((player, idx) => (
                            <div
                              key={player.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                openPlayerStatsModal(player);
                              }}
                              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <img
                                  src={player.avatar}
                                  alt={player.name}
                                  referrerPolicy="no-referrer"
                                  className="w-7 h-7 rounded-full object-cover shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                                    {player.name} {idx === 0 ? '👑 (Host)' : ''}
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                                    {player.levelTitle || 'Player'}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 shrink-0">
                                ★ {player.rating}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Match Rules & Fair Play */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <div className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                          <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          Match Guidelines & Checklist
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="text-emerald-500 font-black">✓</span>
                          <span>Non-marking / turf shoes mandatory for safety</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="text-emerald-500 font-black">✓</span>
                          <span>Coloured bibs and match ball provided at venue</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="text-emerald-500 font-black">✓</span>
                          <span>Arrive 10 minutes prior for warm-up & team briefing</span>
                        </div>
                      </div>

                      {/* Share Match Invite */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={(e) => handleCopyMatch(e, match)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>{copiedMatchId === match.id ? 'Copied Match Invite!' : 'Share Match Squad'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(match.id);
                          }}
                          className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                        >
                          Close Details ↑
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bottom Action Footer with INR (₹) */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Your Share</span>
                      <span className="text-lg font-black text-[#0D1340] dark:text-white">
                        ₹{match.costPerPlayer}
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400"> / player</span>
                      </span>
                    </div>

                    {isUserJoined ? (
                      <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Joined!
                      </div>
                    ) : spotsRemaining > 0 ? (
                      isLive ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onJoinMatch(match);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md shadow-rose-600/30 transition-all cursor-pointer hover:scale-[1.02]"
                        >
                          <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                          <span>Join Live Match</span>
                        </button>
                      ) : (
                        <SportsEquipmentButton
                          sportIcon="trophy"
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onJoinMatch(match);
                          }}
                        >
                          Join Match
                        </SportsEquipmentButton>
                      )
                    ) : (
                      <button
                        disabled
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold cursor-not-allowed"
                      >
                        Squad Full
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
        ) : (
          <div className="py-16 px-4 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto text-3xl mb-3">
              ⚡
            </div>
            <h3 className="text-lg font-black text-[#0D1340] dark:text-white">
              No Open Squads in {selectedCity} Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Be the athlete who gets the game going! Establish a squad at a local turf in {selectedCity}, and other players in this area will see your activity live.
            </p>
            <div className="mt-5 flex justify-center">
              <SportsEquipmentButton
                sportIcon="trophy"
                variant="accent"
                size="md"
                onClick={onOpenHostModal}
              >
                + Establish a Squad in {selectedCity}
              </SportsEquipmentButton>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
