import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SportType, PlayerStats } from '../types';
import {
  X,
  Trophy,
  ShieldCheck,
  Clock,
  Award,
  Zap,
  CheckCircle2,
  Flame,
  Star,
  Activity,
  Crown,
  Share2,
  ThumbsUp,
  Target,
} from 'lucide-react';

export const MyStatsModal: React.FC = () => {
  const { user, userProfile, isMyStatsOpen, setIsMyStatsOpen, isPro, setIsProModalOpen } = useAuth();

  if (!isMyStatsOpen) return null;

  const displayName = userProfile?.displayName || user?.displayName || 'Sports Athlete';
  const avatarUrl =
    userProfile?.photoURL ||
    user?.photoURL ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

  // Use user's profile stats or default to honest initial stats with zero fake data
  const stats: PlayerStats = userProfile?.stats || {
    totalMatchesPlayed: 0,
    hoursPlayed: 0,
    winRatePercentage: 0,
    reliabilityPercentage: 100,
    fairPlayRating: 5.0,
    punctualityRating: 5.0,
    mvpAwards: 0,
    recentForm: [],
    matchesBySport: [],
    endorsements: [],
    favoriteRoles: userProfile?.favoriteSports || ['All-Rounder'],
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

  return (
    <div
      id="my-stats-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header with Player Backdrop */}
        <div className="relative bg-[#070B24] text-white p-6 pb-5 overflow-hidden shrink-0">
          <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 opacity-10 pointer-events-none">
            <Trophy className="w-64 h-64 text-blue-400" />
          </div>

          <button
            onClick={() => setIsMyStatsOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 relative z-10">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-blue-500/40 shadow-xl"
              />
              {isPro ? (
                <span className="absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-md">
                  <Crown className="w-3 h-3 fill-slate-950" />
                  PRO
                </span>
              ) : (
                <span className="absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                  FREE
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{displayName}</h2>
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-600/40 border border-blue-400/40 text-blue-200 text-xs font-bold">
                  {userProfile?.area || 'Sarjapur Road'}, {userProfile?.city || 'Bengaluru'}
                </span>
                <span className="text-xs text-slate-400">
                  Member since {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : '2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick High-Level Metrics Pill Row */}
          <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/10 text-center">
            <div className="p-2 rounded-xl bg-white/5 backdrop-blur-sm">
              <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">
                Matches
              </div>
              <div className="text-lg sm:text-xl font-black text-white">
                {stats.totalMatchesPlayed}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white/5 backdrop-blur-sm">
              <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">
                Win Rate
              </div>
              <div className="text-lg sm:text-xl font-black text-emerald-400">
                {stats.winRatePercentage}%
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white/5 backdrop-blur-sm">
              <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">
                Reliability
              </div>
              <div className="text-lg sm:text-xl font-black text-blue-400">
                {stats.reliabilityPercentage}%
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white/5 backdrop-blur-sm">
              <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">
                MVP Awards
              </div>
              <div className="text-lg sm:text-xl font-black text-amber-400 flex items-center justify-center gap-1">
                <Award className="w-4 h-4" />
                <span>{stats.mvpAwards}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {/* Pro Upgrade Callout if not Pro */}
          {!isPro && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-400/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Unlock Verified Pro Athlete Badge
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Get full scouting reports, 10km radar broadcasts, and direct chat for ₹99/mo.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMyStatsOpen(false);
                  setIsProModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shrink-0 transition-colors cursor-pointer"
              >
                Upgrade ₹99
              </button>
            </div>
          )}

          {/* Detailed Performance Metrics */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <span>Athletic Ratings & Reputation</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Punctuality Rating
                  </span>
                  <Clock className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats.punctualityRating} <span className="text-xs font-normal text-slate-400">/ 5.0</span>
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  Always arrives 10 min before toss
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Fair Play & Conduct
                  </span>
                  <Star className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats.fairPlayRating} <span className="text-xs font-normal text-slate-400">/ 5.0</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Zero conduct flags or disputes
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Total Match Time
                  </span>
                  <Zap className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats.hoursPlayed} <span className="text-xs font-normal text-slate-400">hrs</span>
                </div>
                <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
                  Active athletic stamina
                </p>
              </div>
            </div>
          </div>

          {/* Breakdown By Sport */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              <span>Match Record By Sport</span>
            </h3>

            <div className="space-y-2.5">
              {stats.matchesBySport.length > 0 ? (
                stats.matchesBySport.map((record) => (
                  <div
                    key={record.sport}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700">
                        {getSportEmoji(record.sport)}
                      </span>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white capitalize">
                          {record.sport}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {record.matches} matches ({record.wins}W - {record.losses}L)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      {record.mvps && (
                        <div className="flex items-center gap-1 text-xs font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">
                          <Award className="w-3.5 h-3.5" />
                          <span>{record.mvps} MVPs</span>
                        </div>
                      )}
                      <div className="text-right">
                        <div className="text-sm font-black text-slate-900 dark:text-white">
                          {record.winRate}%
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Win Rate</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    No verified matches logged yet. Join a match under "Find Squad" or book a court to establish your record!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Form Streak */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Recent Match Form</span>
            </h3>

            {stats.recentForm.length > 0 ? (
              <div className="flex items-center gap-2">
                {stats.recentForm.map((res, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                      res === 'W'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : res === 'L'
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-400 text-white'
                    }`}
                  >
                    {res}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                Form streak updates automatically as you complete matches.
              </div>
            )}
          </div>

          {/* Community Endorsements & Peer Ratings */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
              <ThumbsUp className="w-3.5 h-3.5 text-blue-500" />
              <span>Verified Teammate Endorsements</span>
            </h3>

            {stats.endorsements.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {stats.endorsements.map((end, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5"
                  >
                    <span>{end.tag}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-blue-200 dark:bg-blue-900/80 text-[10px] font-black">
                      +{end.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <p className="text-xs text-blue-900 dark:text-blue-300 font-medium">
                  Peer Ratings: Endorsements and badges are awarded directly by other verified players who participate in the same match with you.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Verified Athletic Record • SportSync ID: {user?.uid.slice(0, 8) || 'athlete'}
          </div>
          <button
            onClick={() => setIsMyStatsOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
