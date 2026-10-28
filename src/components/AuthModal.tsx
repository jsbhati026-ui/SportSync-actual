import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SportSyncLogo } from './SportSyncLogo';
import { X, ShieldCheck, MapPin, Trophy, Users } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    signInWithGoogle,
    signInDemoUser,
    registerAsNewAthlete,
    isLoading,
  } = useAuth();

  const [mode, setMode] = React.useState<'signin' | 'register'>('register');
  const [newPlayerName, setNewPlayerName] = React.useState<string>('');

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 relative">
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="bg-[#070B24] text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="flex justify-center mb-3">
            <SportSyncLogo size="lg" lightText={true} />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {mode === 'register' ? 'Register New Athlete Account' : 'Welcome Back to SportSync'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xs mx-auto">
            {mode === 'register'
              ? 'Create your free account to book courts, join squads, and get 10km live match alerts.'
              : 'Sign in to access your bookings, squad invites, and athletic profile.'}
          </p>

          {/* Tab Selector */}
          <div className="mt-4 inline-flex p-1 rounded-xl bg-slate-900/80 border border-slate-700/80 max-w-xs w-full">
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ✨ Register (New User)
            </button>
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Action Body */}
        <div className="p-6 sm:p-7 space-y-4">
          {/* Primary Google Auth Button */}
          <button
            type="button"
            disabled={isLoading}
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-extrabold text-sm shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-60"
          >
            {/* Google Brand SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {isLoading
                ? 'Connecting to Google...'
                : mode === 'register'
                ? 'Register with Google'
                : 'Continue with Google'}
            </span>
          </button>

          {/* Quick Athlete Registration / Preview Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <span className="relative px-3 bg-white dark:bg-slate-900 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {mode === 'register' ? 'Or instant athlete registration' : 'Or quick preview'}
            </span>
          </div>

          {mode === 'register' ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter your name (e.g. Karan Sharma)"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => registerAsNewAthlete(newPlayerName.trim() || 'New Athlete')}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🚀 Complete Free Registration & Set Sports</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => signInDemoUser()}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer text-center"
            >
              ⚡ Test Sign-In with Demo Player
            </button>
          )}

          {/* Benefit items */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Standard (Free): Turf Booking, Finding Squad, Gear Sharing</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
              <span>SportSync Pro (₹99): 10km Live Broadcast, SOS Pings & Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Verified player badges & safe community gear sharing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
