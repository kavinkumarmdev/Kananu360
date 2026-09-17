import React from 'react';
import { useFinance } from '../../context/FinanceContext';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  onClick,
}) => {
  const { settings } = useFinance();
  const isTamil = settings.language === 'ta';

  // Size configurations
  const sizeConfig = {
    sm: {
      iconSize: 'w-7 h-7',
      svgScale: 28,
      titleText: 'text-base',
      badgeText: 'text-[10px] px-1 py-0.5',
      subText: 'text-[9px]',
    },
    md: {
      iconSize: 'w-9 h-9',
      svgScale: 36,
      titleText: 'text-lg',
      badgeText: 'text-xs px-1.5 py-0.5',
      subText: 'text-[10px]',
    },
    lg: {
      iconSize: 'w-11 h-11',
      svgScale: 44,
      titleText: 'text-xl',
      badgeText: 'text-xs px-2 py-0.5',
      subText: 'text-[11px]',
    },
    xl: {
      iconSize: 'w-14 h-14',
      svgScale: 56,
      titleText: 'text-2xl sm:text-3xl',
      badgeText: 'text-sm px-2.5 py-1',
      subText: 'text-xs tracking-widest',
    },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 select-none transition-all group ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Dynamic 360 Agri-Finance Emblem */}
      <div
        className={`${sizeConfig.iconSize} shrink-0 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-emerald-500/40 p-1 flex items-center justify-center shadow-lg shadow-emerald-950/40 group-hover:border-emerald-400/70 transition-all relative overflow-hidden`}
      >
        {/* Ambient Ring Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/30 via-teal-500/20 to-emerald-400/30 rounded-2xl animate-pulse" />

        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow"
        >
          {/* Circular 360 Flow Ring */}
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="url(#ringGradient)"
            strokeWidth="2.5"
            strokeDasharray="75 25"
            strokeLinecap="round"
          />

          {/* Central Golden-Emerald Sprout Leaf */}
          <path
            d="M20 28C20 28 20 22 24 18C28 14 26 10 26 10C26 10 22 12 18 16C15 19 15.5 24 20 28Z"
            fill="url(#leafGradient)"
          />
          <path
            d="M20 28C20 28 19 23 15 20C11 17 13 13 13 13C13 13 17 15 20 18.5"
            stroke="#10B981"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Core Energy Dot */}
          <circle cx="20" cy="28" r="1.8" fill="#F59E0B" />

          {/* Gradients */}
          <defs>
            <linearGradient id="ringGradient" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="0.5" stopColor="#06B6D4" />
              <stop offset="1" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="leafGradient" x1="15" y1="10" x2="26" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34D399" />
              <stop offset="0.7" stopColor="#10B981" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black ${sizeConfig.titleText} tracking-tight ${
              settings.theme === 'light'
                ? 'text-slate-900'
                : 'bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent'
            }`}
          >
            {isTamil ? 'கணக்கு' : 'Kanakku'}
          </span>
          <span
            className={`font-black ${sizeConfig.badgeText} rounded-lg bg-gradient-to-r from-indigo-600 to-emerald-500 text-white shadow-sm border border-emerald-400/40 tracking-wider`}
          >
            360
          </span>
        </div>

        {showSubtitle && (
          <span
            className={`${sizeConfig.subText} ${
              settings.theme === 'light'
                ? 'text-emerald-700 font-extrabold'
                : 'text-emerald-400/90 font-bold'
            } uppercase tracking-wider -mt-0.5 hidden xs:block truncate`}
          >
            {isTamil ? 'பண்ணை & குடும்ப கணக்கு' : 'Farm & Personal Ledger'}
          </span>
        )}
      </div>
    </div>
  );
};
