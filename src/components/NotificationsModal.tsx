import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MatchNotification, SportType } from '../types';
import { SPORT_CATEGORIES } from '../data/sportsData';
import { X, Bell, MapPin, Calendar, Clock, CheckCheck, Trash2, Radio } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMatch: (matchId: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onSelectMatch,
}) => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    clearAllNotifications,
    userProfile,
    setIsOnboardingOpen,
  } = useAuth();

  if (!isOpen) return null;

  const getSportIcon = (sport: SportType) => {
    const found = SPORT_CATEGORIES.find((c) => c.id === sport);
    return found ? found.icon : '🏆';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="bg-[#070B24] text-white p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center relative">
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-base font-black text-white">10 km Proximity Match Alerts</h3>
              <p className="text-xs text-slate-300">
                Matches hosted within 10 km of your location in your favourite sports
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User's Current Radar Status Bar */}
        <div className="px-5 py-3 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold">
            <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>
              Radar Active: {userProfile?.area || 'Sarjapur Road'}, {userProfile?.city || 'Bengaluru'}
            </span>
          </div>

          <button
            onClick={() => {
              onClose();
              setIsOnboardingOpen(true);
            }}
            className="text-[11px] text-blue-700 dark:text-blue-400 font-extrabold hover:underline cursor-pointer"
          >
            Edit Sports & Radius
          </button>
        </div>

        {/* Notification List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No match alerts yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Whenever another player hosts a game in your favourite sports within 10 km of your location, it will instantly show up here!
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationAsRead(notif.id);
                  onSelectMatch(notif.matchId);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  notif.read
                    ? 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 opacity-90'
                    : 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 hover:border-blue-300 dark:hover:border-blue-800 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-100 dark:border-slate-700">
                      {getSportIcon(notif.sport)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        {notif.isPlayNowAlert ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            ⚡ Play Right Now Alert
                          </span>
                        ) : (
                          <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                            {notif.sport} Match
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                          <MapPin className="w-3 h-3" />
                          {notif.distanceKm} km away (≤ 10km)
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {notif.matchTitle}
                      </h4>
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {notif.venueName} • {notif.area}
                        </span>
                        {notif.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {notif.date}
                          </span>
                        )}
                        {notif.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {notif.time}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!notif.read && (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 mt-1" />
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    View Game & Join Squad →
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={clearAllNotifications}
              className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
            <button
              onClick={() => {
                notifications.forEach((n) => markNotificationAsRead(n.id));
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
