import React from 'react';

interface SportSyncLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  lightText?: boolean;
}

export const SportSyncLogo: React.FC<SportSyncLogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
  lightText = false,
}) => {
  const sizeMap = {
    sm: { icon: 30, text: 'text-lg', height: 'h-8' },
    md: { icon: 40, text: 'text-2xl', height: 'h-10' },
    lg: { icon: 52, text: 'text-3xl', height: 'h-13' },
    xl: { icon: 68, text: 'text-4xl', height: 'h-16' },
  };

  const { icon, text, height } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 font-sans select-none ${className}`} id="sportsync-logo-root">
      {/* Exact SportSync S-Icon Vector recreated accurately from the user's uploaded logo */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="ssCyanGrad" x1="20" y1="20" x2="110" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00A8FF" />
            <stop offset="50%" stopColor="#0080FF" />
            <stop offset="100%" stopColor="#0052D4" />
          </linearGradient>
          <linearGradient id="ssPurpleGrad" x1="40" y1="40" x2="80" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
          <filter id="ssShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Outer Dark Navy S-ribbon */}
        <path
          d="M 96 18 C 76 6 42 10 30 28 C 18 46 22 70 36 84 L 14 116 C 34 132 72 130 92 114 C 112 98 116 76 108 58 L 96 18 Z"
          fill="#0D1340"
        />

        {/* Dynamic Electric Cyan Curve Ribbon */}
        <path
          d="M 88 28 C 72 18 48 22 38 34 C 28 46 32 64 46 76 C 56 84 62 92 58 104 C 54 114 42 118 28 114 L 44 122 C 68 122 88 108 92 88 C 96 72 84 60 70 50 C 58 42 54 36 58 28 C 62 22 74 20 84 24 L 88 28 Z"
          fill="url(#ssCyanGrad)"
        />

        {/* Purple Accenting Inner Arc */}
        <path
          d="M 52 42 C 62 48 72 58 68 70 C 64 82 50 88 40 84 C 34 80 32 72 36 62 C 40 54 46 46 52 42 Z"
          fill="url(#ssPurpleGrad)"
        />

        {/* Central Core Ring */}
        <circle cx="68" cy="68" r="21" fill="#0D1340" />
        
        {/* Ball Core */}
        <circle cx="68" cy="68" r="16" fill="#7836D6" />

        {/* Tennis / Padel Ball curved seams */}
        <path
          d="M 60 58 C 65 65 65 71 60 78"
          stroke="#00A8FF"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 76 58 C 71 65 71 71 76 78"
          stroke="#00A8FF"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Dark pupil center */}
        <circle cx="68" cy="68" r="6" fill="#0D1340" />
      </svg>

      {/* SportSync Wordmark */}
      {showText && (
        <span
          className={`font-extrabold tracking-tight font-sans ${text} ${
            lightText ? 'text-white' : 'text-[#0D1340] dark:text-white'
          }`}
          style={{ letterSpacing: '-0.03em' }}
        >
          Sport<span className={lightText ? 'text-blue-400' : 'text-blue-600 dark:text-blue-400'}>Sync</span>
        </span>
      )}
    </div>
  );
};
