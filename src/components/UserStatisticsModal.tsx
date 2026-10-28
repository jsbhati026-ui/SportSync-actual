import React from 'react';
import {
  X,
  Trophy,
  Activity,
  Flame,
  Star,
  Clock,
  Award,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserStatisticsModal: React.FC<UserStatisticsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { userProfile, isPro, setIsProModalOpen } = useAuth();

  if (!isOpen) return null;

  const stats = userProfile?.stats || {
    totalMatchesPlayed: 0,
    matchesBySport: [],
    hoursPlayed: 0,
    winRatePercentage: 0,
    reliabilityPercentage: 100,
    fairPlayRating: 5.0,
    punctualityRating: 5.0,
    mvpAwards: 0,
    recentForm: [],
    endorsements: [],
    favoriteRoles: [],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={
                  userProfile?.photoURL ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                }
                alt={userProfile?.displayName || 'Player'}
                className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
              />
              {isPro && (
                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full shadow">
                  PRO
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {userProfile?.displayName || 'Sports Player'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[11px] font-semibold">
                  {userProfile?.area || 'Sector 12'}, {userProfile?.city || 'Chandigarh'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official Athlete Performance & Match History
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Activity className="w-4 h-4 text-blue-500" />
                <span>Matches</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.totalMatchesPlayed}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Real verified games</div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Win Rate</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.winRatePercentage > 0 ? `${stats.winRatePercentage}%` : '—'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Competitive matches</div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Star className="w-4 h-4 text-amber-500" />
                <span>Peer Rating</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.fairPlayRating.toFixed(1)} <span className="text-xs text-slate-400">/ 5.0</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Rated by real opponents</div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>Reliability</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.reliabilityPercentage}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Turnout punctuality</div>
            </div>
          </div>

          {/* Real Post-Match Ratings Information */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-xs">
            <div className="flex items-center space-x-2 font-bold text-emerald-900 dark:text-emerald-200 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Real Player Rating System</span>
            </div>
            <p className="text-emerald-800/80 dark:text-emerald-300/80">
              Ratings and endorsements on Turf & Squad are earned strictly through real match participation. After each completed match, fellow players submit peer reviews for skill, punctuality, and sportsmanship.
            </p>
          </div>

          {/* Sports Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Matches by Sport
            </h3>

            {stats.matchesBySport && stats.matchesBySport.length > 0 ? (
              <div className="space-y-2">
                {stats.matchesBySport.map((item) => (
                  <div
                    key={item.sport}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="capitalize font-bold text-slate-800 dark:text-slate-200">
                        {item.sport}
                      </span>
                      <span className="text-slate-400">({item.matches} matches)</span>
                    </div>

                    <div className="flex items-center space-x-3 text-slate-500">
                      <span>{item.wins} Wins</span>
                      <span>{item.losses} Losses</span>
                      <span className="font-bold text-emerald-600">{item.winRate}% Win Rate</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Trophy className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  No verified matches played yet
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Host or join an open match to begin logging your official stats!
                </p>
              </div>
            )}
          </div>

          {/* Pro Upgrade Callout if not pro */}
          {!isPro && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-1.5 font-bold text-amber-900 dark:text-amber-200 text-xs">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Unlock Advanced Head-to-Head Pro Analytics</span>
                </div>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                  Get pitch heatmaps, opponent analysis, and 10km GPS Live Broadcast with Pro (₹99/mo).
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setIsProModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-sm shrink-0"
              >
                Upgrade (₹99)
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
