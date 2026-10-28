import React from 'react';

export type SportsIconType = 'cricket' | 'football' | 'badminton' | 'basketball' | 'tennis' | 'trophy' | 'lightning' | 'gear';

interface SportsEquipmentButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  sportIcon?: SportsIconType;
  variant?: 'primary' | 'secondary' | 'accent' | 'court' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  iconPosition?: 'left' | 'right';
  badge?: string;
}

export const SportsEquipmentIcon: React.FC<{ type: SportsIconType; className?: string }> = ({ type, className = 'w-4 h-4' }) => {
  switch (type) {
    case 'cricket':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          {/* Cricket Bat (Wood grain tone) & Red Leather Seam Ball */}
          <path d="M 4 20 L 7 17 L 17 7 C 18.5 5.5 17.5 3 16 3 C 14.5 3 12 5.5 10.5 7 L 3 14.5 Z" fill="#D97706" stroke="#92400E" strokeWidth="1.2" />
          {/* Bat handle with white rubber grip wrap */}
          <line x1="2" y1="22" x2="5" y2="19" stroke="#F8FAFC" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="2" y1="22" x2="5" y2="19" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
          {/* Cricket Red leather ball with white seam */}
          <circle cx="18.5" cy="18.5" r="4.5" fill="#DC2626" stroke="#991B1B" strokeWidth="1" />
          <path d="M 15.5 16 C 18 17.5 19 19.5 21.5 21" stroke="#FEF08A" strokeWidth="1" strokeDasharray="1 1" />
        </svg>
      );
    case 'football':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="10" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          <polygon points="12,7 16,10 14.5,15 9.5,15 8,10" fill="#0F172A" />
          <line x1="12" y1="7" x2="12" y2="2" stroke="#0F172A" strokeWidth="1.5" />
          <line x1="16" y1="10" x2="21" y2="9" stroke="#0F172A" strokeWidth="1.5" />
          <line x1="14.5" y1="15" x2="18" y2="20" stroke="#0F172A" strokeWidth="1.5" />
          <line x1="9.5" y1="15" x2="6" y2="20" stroke="#0F172A" strokeWidth="1.5" />
          <line x1="8" y1="10" x2="3" y2="9" stroke="#0F172A" strokeWidth="1.5" />
        </svg>
      );
    case 'badminton':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
          <ellipse cx="12" cy="19" rx="3" ry="2.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          <path d="M 9.5 17.5 L 5 4 L 19 4 L 14.5 17.5 Z" fill="#F1F5F9" stroke="#0F172A" strokeWidth="1.2" />
          <line x1="8.5" y1="4" x2="10.5" y2="17" stroke="#94A3B8" strokeWidth="1" />
          <line x1="12" y1="4" x2="12" y2="17" stroke="#94A3B8" strokeWidth="1" />
          <line x1="15.5" y1="4" x2="13.5" y2="17" stroke="#94A3B8" strokeWidth="1" />
        </svg>
      );
    case 'basketball':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="10" fill="#EA580C" stroke="#9A3412" strokeWidth="1.5" />
          <line x1="2" y1="12" x2="22" y2="12" stroke="#431407" strokeWidth="1.5" />
          <line x1="12" y1="2" x2="12" y2="22" stroke="#431407" strokeWidth="1.5" />
          <path d="M 5 5 C 9 8 9 16 5 19" stroke="#431407" strokeWidth="1.3" />
          <path d="M 19 5 C 15 8 15 16 19 19" stroke="#431407" strokeWidth="1.3" />
        </svg>
      );
    case 'tennis':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="10" fill="#CCFF00" stroke="#84CC16" strokeWidth="1.5" />
          <path d="M 4.93 4.93 C 9.5 9.5 9.5 14.5 4.93 19.07" stroke="#15803D" strokeWidth="1.5" />
          <path d="M 19.07 4.93 C 14.5 9.5 14.5 14.5 19.07 19.07" stroke="#15803D" strokeWidth="1.5" />
        </svg>
      );
    case 'trophy':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.45 1-1 1H7" />
          <path d="M14 14.66V17c0 .55.45 1 1 1h2" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" fill="#FDE047" stroke="#EAB308" />
        </svg>
      );
    case 'lightning':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#FBBF24" stroke="#D97706" />
        </svg>
      );
    case 'gear':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    default:
      return null;
  }
};

export const SportsEquipmentButton: React.FC<SportsEquipmentButtonProps> = ({
  sportIcon,
  variant = 'primary',
  size = 'md',
  children,
  iconPosition = 'left',
  badge,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-bold gap-1.5 rounded-lg',
    md: 'px-4 py-2.5 text-sm font-extrabold gap-2 rounded-xl',
    lg: 'px-6 py-3.5 text-base font-black tracking-wide gap-2.5 rounded-2xl',
  };

  const variantClasses = {
    primary:
      'bg-[#0D1340] hover:bg-[#182361] text-white shadow-sm hover:shadow-md active:scale-[0.98] border border-blue-900/40 relative overflow-hidden group',
    secondary:
      'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-blue-500/20 active:scale-[0.98]',
    accent:
      'bg-amber-400 hover:bg-amber-500 text-slate-950 font-black shadow-sm active:scale-[0.98]',
    court:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-[0.98] border border-emerald-500/30',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-xs active:scale-[0.98]',
    ghost:
      'bg-slate-100 hover:bg-slate-200/90 text-slate-800 active:scale-[0.98] border border-slate-200',
  };

  return (
    <button
      className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer select-none font-sans ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {sportIcon && iconPosition === 'left' && (
        <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">
          <SportsEquipmentIcon type={sportIcon} className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        </span>
      )}

      <span className="relative z-10 whitespace-nowrap">{children}</span>

      {sportIcon && iconPosition === 'right' && (
        <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">
          <SportsEquipmentIcon type={sportIcon} className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        </span>
      )}

      {badge && (
        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-white/20 text-white">
          {badge}
        </span>
      )}
    </button>
  );
};
