import React from 'react';
import { useSocial } from '../context/SocialContext';
import { SportType } from '../types';
import {
  X,
  Trophy,
  ShieldCheck,
  Clock,
  Award,
  Zap,
  CheckCircle2,
  MessageSquare,
  UserPlus,
  Flame,
  Star,
  Activity,
  HeartHandshake,
} from 'lucide-react';

export const PlayerStatsModal: React.FC = () => {
  const {
    selectedPlayerForStats,
    closePlayerStatsModal,
    friends,
    addFriend,
    openChatWithPlayer,
  } = useSocial();

  if (!selectedPlayerForStats) return null;

  const player = selectedPlayerForStats;
  const stats = player.stats;
  const isFriend = friends.some((f) => f.playerId === player.id);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header with Player Backdrop */}
        <div className="relative bg-[#070B24] text-white p-6 pb-5 overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 opacity-10 pointer-events-none">
            <Trophy className="w-64 h-64 text-blue-400" />
          </div>

          <button
            onClick={closePlayerStatsModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={player.avatar}
                  alt={player.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-blue-500 shadow-xl"
                />
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider">
                  VERIFIED
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {player.name}
                  </h2>
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-xs sm:text-sm text-blue-300 font-extrabold">
                  {player.levelTitle}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
                  <span className="text-amber-400 font-black">★ {player.rating} / 5.0</span>
                  <span>•</span>
                  <span>{player.locality || 'Active Turf Player'}</span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  closePlayerStatsModal();
                  openChatWithPlayer(player);
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat</span>
              </button>

              <button
                onClick={() => addFriend(player)}
                disabled={isFriend}
                className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                  isFriend
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                }`}
              >
                {isFriend ? '✓ Friends' : '+ Add Friend'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Key Metric Highlights Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 text-center">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-1">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block">
                {stats?.totalMatchesPlayed || player.matchesPlayed}
              </span>
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400">
                Total Matches
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60 text-center">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-1">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block">
                {stats?.winRatePercentage || 70}%
              </span>
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400">
                Win Rate
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/60 text-center">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-1">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block">
                {stats?.hoursPlayed || 45}h
              </span>
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400">
                Court Hours
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 text-center">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-1">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block">
                {stats?.mvpAwards || 5}
              </span>
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400">
                MVP Awards
              </span>
            </div>
          </div>

          {/* Refined Breakdown: Matches Played by Sport */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Detailed Match Record by Sport
            </h3>

            <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="grid grid-cols-5 p-3 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <span className="col-span-2">Sport</span>
                <span className="text-center">Matches</span>
                <span className="text-center">Record (W-L)</span>
                <span className="text-right">Win Rate</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {(stats?.matchesBySport || [
                  { sport: 'cricket', matches: 20, wins: 14, losses: 6, winRate: 70 },
                  { sport: 'badminton', matches: 12, wins: 8, losses: 4, winRate: 66.7 },
                  { sport: 'football', matches: 6, wins: 4, losses: 2, winRate: 66.7 },
                ]).map((rec: any) => (
                  <div key={rec.sport} className="grid grid-cols-5 p-3 text-xs items-center">
                    <div className="col-span-2 flex items-center gap-2 font-bold text-slate-900 dark:text-white capitalize">
                      <span className="text-base">{getSportEmoji(rec.sport)}</span>
                      <span>{rec.sport}</span>
                      {rec.mvps ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-extrabold">
                          {rec.mvps} MVP
                        </span>
                      ) : null}
                    </div>
                    <div className="text-center font-extrabold text-slate-700 dark:text-slate-300">
                      {rec.matches}
                    </div>
                    <div className="text-center font-bold text-slate-600 dark:text-slate-400">
                      <span className="text-emerald-600 dark:text-emerald-400">{rec.wins}W</span> -{' '}
                      <span className="text-rose-600 dark:text-rose-400">{rec.losses}L</span>
                    </div>
                    <div className="text-right font-black text-blue-600 dark:text-blue-400">
                      {rec.winRate}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Guide & Reliability Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Recent Form */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Recent Form Guide
                </span>
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-center gap-2 pt-1">
                {(stats?.recentForm || ['W', 'W', 'L', 'W', 'W']).map((res: string, i: number) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-xs ${
                      res === 'W'
                        ? 'bg-emerald-500 text-white'
                        : res === 'L'
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {res}
                  </div>
                ))}
                <span className="text-xs text-slate-400 font-bold ml-1">(Last 5 games)</span>
              </div>
            </div>

            {/* Punctuality & Sportsmanship Index */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Fair Play & Reliability
              </span>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300">Punctuality Score:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    {stats?.punctualityRating || 4.9} / 5.0 ★
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${((stats?.punctualityRating || 4.9) / 5) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-bold text-slate-600 dark:text-slate-300">Fair Play & Team Spirit:</span>
                  <span className="font-black text-blue-600 dark:text-blue-400">
                    {stats?.fairPlayRating || 4.9} / 5.0 ★
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${((stats?.fairPlayRating || 4.9) / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Endorsements by Teammates */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Teammate Endorsements
            </h3>

            <div className="flex flex-wrap gap-2">
              {(stats?.endorsements || [
                { tag: 'Fair Play Champion', count: 24 },
                { tag: 'Punctual & Reliable', count: 32 },
                { tag: 'Clutch Finisher', count: 14 },
                { tag: 'Team Motivator', count: 19 },
              ]).map((end: any) => (
                <span
                  key={end.tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{end.tag}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-black">
                    +{end.count}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Roles */}
          {stats?.favoriteRoles && stats.favoriteRoles.length > 0 && (
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
                Preferred Playing Roles
              </span>
              <div className="flex flex-wrap gap-2">
                {stats.favoriteRoles.map((role: string) => (
                  <span
                    key={role}
                    className="px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/60 text-xs font-extrabold"
                  >
                    ⚡ {role}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Stats verified by SportSync Match Engine
          </span>
          <button
            onClick={closePlayerStatsModal}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
