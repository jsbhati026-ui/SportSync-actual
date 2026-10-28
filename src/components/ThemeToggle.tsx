import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Monitor, ChevronDown, Check } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { theme, actualTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'compact') {
    return (
      <div className={`relative inline-block ${className}`} ref={dropdownRef}>
        <button
          type="button"
          id="theme-mode-toggle-btn"
          aria-label={`Current theme is ${theme}. Click to switch theme.`}
          title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)} (Click to switch)`}
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-slate-200/70 dark:border-slate-700 flex items-center justify-center gap-1 group"
        >
          {actualTheme === 'dark' ? (
            <Moon className="w-4 h-4 text-amber-300 transition-transform group-hover:-rotate-12" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 transition-transform group-hover:rotate-45" />
          )}
          <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500 opacity-60 group-hover:opacity-100" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 p-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Appearance
            </div>
            <button
              id="theme-select-light"
              onClick={() => {
                setTheme('light');
                setIsOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </div>
              {theme === 'light' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
            </button>

            <button
              id="theme-select-dark"
              onClick={() => {
                setTheme('dark');
                setIsOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                <span>Dark</span>
              </div>
              {theme === 'dark' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
            </button>

            <button
              id="theme-select-system"
              onClick={() => {
                setTheme('system');
                setIsOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                theme === 'system'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Monitor className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>System</span>
              </div>
              {theme === 'system' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Full segmented control variant (for settings or drawers)
  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${className}`}
      id="theme-segmented-toggle"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          theme === 'light'
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Sun className="w-3.5 h-3.5 text-amber-500" />
        <span>Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          theme === 'dark'
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Moon className="w-3.5 h-3.5 text-amber-300" />
        <span>Dark</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('system')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          theme === 'system'
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Monitor className="w-3.5 h-3.5 text-slate-500" />
        <span>System</span>
      </button>
    </div>
  );
};
