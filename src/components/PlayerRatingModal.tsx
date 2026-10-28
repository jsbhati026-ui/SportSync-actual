import React, { useState } from 'react';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import { PlayerRatingSubmission } from '../types';
import {
  X,
  Star,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  HeartHandshake,
  MessageSquare,
} from 'lucide-react';

const AVAILABLE_ENDORSEMENTS = [
  'Punctual & On Time',
  'Fair Play Champion',
  'Clutch Finisher',
  'Team Motivator',
  'Agile Runner',
  'Great Communicator',
  'Power Hitter',
  'Solid Defender',
  'Never Gives Up',
];

export const PlayerRatingModal: React.FC = () => {
  const { rateTargetTeammate, closeRatePlayerModal, submitPlayerRating } = useSocial();
  const { user, userProfile } = useAuth();

  const [overallRating, setOverallRating] = useState<number>(5);
  const [punctualityRating, setPunctualityRating] = useState<number>(5);
  const [sportsmanshipRating, setSportsmanshipRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Punctual & On Time', 'Fair Play Champion']);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  if (!rateTargetTeammate) return null;

  const { player, matchTitle, matchDate, venueName, sport, hasRated, existingRating } = rateTargetTeammate;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    } else {
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submission: PlayerRatingSubmission = {
      reviewerId: user?.uid || userProfile?.uid || 'usr_me',
      reviewerName: userProfile?.displayName || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Sports Athlete'),
      targetPlayerId: player.id,
      targetPlayerName: player.name,
      matchId: rateTargetTeammate.matchId,
      matchTitle,
      sport,
      overallRating,
      punctualityRating,
      sportsmanshipRating,
      selectedTags,
      feedbackComment: comment.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    await submitPlayerRating(submission);
    setIsSubmitting(false);
    setSubmittedSuccess(true);

    setTimeout(() => {
      setSubmittedSuccess(false);
      closeRatePlayerModal();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#070B24] text-white p-5 sm:p-6 relative">
          <button
            onClick={closeRatePlayerModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
            <Award className="w-4 h-4" />
            <span>Post-Match Peer Endorsement</span>
          </div>

          <h2 className="text-xl font-black text-white">Rate Last Match Teammate</h2>
          <p className="text-xs text-slate-300 mt-1">
            Reward fair play, reliability, and sportsmanship for your recent game.
          </p>

          {/* Teammate & Match Card */}
          <div className="mt-4 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
            <img
              src={player.avatar}
              alt={player.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-400 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white truncate">{player.name}</span>
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              </div>
              <div className="text-xs text-blue-200 font-bold truncate">
                {player.levelTitle} • Current ★ {player.rating}
              </div>
              <div className="text-[11px] text-slate-300 truncate mt-0.5">
                Match: {matchTitle}
              </div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        {submittedSuccess ? (
          <div className="p-8 text-center space-y-3 my-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Rating & Endorsements Submitted!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Thank you for keeping our sports community verified and reliable. {player.name}'s profile has been updated!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* 1. Overall Match Performance */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  1. Overall Skill & Matchplay
                </label>
                <span className="text-xs font-black text-amber-500">{overallRating} / 5 Stars</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-2xl justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setOverallRating(star)}
                    className="p-1.5 text-2xl transition-transform hover:scale-125 focus:outline-hidden cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= overallRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Punctuality & Turnout */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  2. Punctuality & On-Time Arrival
                </label>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {punctualityRating} / 5 Stars
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-2xl justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setPunctualityRating(star)}
                    className="p-1.5 text-2xl transition-transform hover:scale-125 focus:outline-hidden cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= punctualityRating
                          ? 'text-emerald-500 fill-emerald-500'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Sportsmanship & Fair Play */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  3. Sportsmanship & Team Conduct
                </label>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                  {sportsmanshipRating} / 5 Stars
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-2xl justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setSportsmanshipRating(star)}
                    className="p-1.5 text-2xl transition-transform hover:scale-125 focus:outline-hidden cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= sportsmanshipRating
                          ? 'text-blue-600 fill-blue-600'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Endorsement Badges */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Select Endorsement Badges
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ENDORSEMENTS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-2 border-amber-400 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Comment */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                Teammate Feedback Note (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="e.g. Fantastic cover fielding, punctual turnout, and positive communication throughout the match."
                className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 border border-transparent focus:border-blue-600 focus:outline-hidden resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <span>Submitting Endorsement...</span>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Submit Teammate Rating</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
