import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock } from 'lucide-react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  min?: string;
  max?: string;
  showPresets?: boolean;
  disabled?: boolean;
  id?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAY_NAMES_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  required = false,
  className = '',
  min,
  max,
  showPresets = true,
  disabled = false,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current selected or fallback to today
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const initialYear = selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate.getFullYear() : new Date().getFullYear();
  const initialMonth = selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate.getMonth() : new Date().getMonth();

  const [viewYear, setViewYear] = useState<number>(initialYear);
  const [viewMonth, setViewMonth] = useState<number>(initialMonth);

  // Sync view when value changes from outside
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const formatLocalDate = (year: number, month: number, day: number): string => {
    const yStr = year.toString();
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    return `${yStr}-${mStr}-${dStr}`;
  };

  const handlePreset = (preset: 'today' | 'yesterday' | 'prevWeek') => {
    const today = new Date();
    if (preset === 'today') {
      const d = formatLocalDate(today.getFullYear(), today.getMonth(), today.getDate());
      onChange(d);
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
    } else if (preset === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const d = formatLocalDate(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      onChange(d);
      setViewYear(yesterday.getFullYear());
      setViewMonth(yesterday.getMonth());
    } else if (preset === 'prevWeek') {
      const prevWeek = new Date(today);
      prevWeek.setDate(today.getDate() - 7);
      const d = formatLocalDate(prevWeek.getFullYear(), prevWeek.getMonth(), prevWeek.getDate());
      onChange(d);
      setViewYear(prevWeek.getFullYear());
      setViewMonth(prevWeek.getMonth());
    }
    setIsOpen(false);
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarDays: Array<{ day: number; isCurrentMonth: boolean; dateStr: string }> = [];

  // Previous month filler days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    calendarDays.push({
      day: d,
      isCurrentMonth: false,
      dateStr: formatLocalDate(y, m, d),
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      dateStr: formatLocalDate(viewYear, viewMonth, i),
    });
  }

  // Next month filler days to complete grid (up to 35 or 42)
  const remainingCells = (calendarDays.length <= 35 ? 35 : 42) - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      dateStr: formatLocalDate(y, m, i),
    });
  }

  // Display text formatting
  const todayStr = formatLocalDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  let displayValue = placeholder;
  let isToday = false;
  let isYesterday = false;

  if (value) {
    if (value === todayStr) {
      isToday = true;
    } else {
      const yDate = new Date();
      yDate.setDate(yDate.getDate() - 1);
      const yStr = formatLocalDate(yDate.getFullYear(), yDate.getMonth(), yDate.getDate());
      if (value === yStr) isYesterday = true;
    }

    const d = new Date(value + 'T00:00:00');
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const month = MONTH_NAMES_SHORT[d.getMonth()];
      const year = d.getFullYear();
      displayValue = `${day} ${month} ${year}${isToday ? ' (Today)' : isYesterday ? ' (Yesterday)' : ''}`;
    } else {
      displayValue = value;
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Main trigger button */}
      <div
        id={id}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) setIsOpen(!isOpen);
          }
        }}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition select-none ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-slate-900/50 border border-slate-800 text-slate-500'
            : isOpen
            ? 'ring-2 ring-emerald-500/50 border-emerald-500 bg-slate-900 text-white'
            : value
            ? 'glass-input border-emerald-500/30 text-white hover:border-emerald-400/50'
            : 'glass-input text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon size={15} className={value ? 'text-emerald-400 shrink-0' : 'text-slate-400 shrink-0'} />
          <span className={value ? 'font-semibold text-slate-100' : 'text-slate-400'}>
            {displayValue}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && !required && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title="Clear date"
            >
              <X size={13} />
            </button>
          )}
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${isToday ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-500'}`}>
            📅
          </span>
        </div>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 left-0 w-72 sm:w-80 p-3 rounded-2xl bg-slate-950 border border-emerald-500/30 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-2.5">
          {/* Header Month / Year controls */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1.5 font-bold text-xs text-white">
              <span className="text-emerald-400">{MONTH_NAMES[viewMonth]}</span>
              <span>{viewYear}</span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Presets */}
          {showPresets && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
              <button
                type="button"
                onClick={() => handlePreset('today')}
                className="px-2 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-800 hover:text-white font-semibold transition shrink-0"
              >
                Today (இன்று)
              </button>
              <button
                type="button"
                onClick={() => handlePreset('yesterday')}
                className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white font-medium transition shrink-0"
              >
                Yesterday (நேற்று)
              </button>
              <button
                type="button"
                onClick={() => handlePreset('prevWeek')}
                className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white font-medium transition shrink-0"
              >
                -7 Days (வாரம் முன்)
              </button>
            </div>
          )}

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
            {DAY_NAMES_SHORT.map((d, i) => (
              <div key={d} className={i === 0 || i === 6 ? 'text-amber-400' : ''}>
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {calendarDays.map((item, idx) => {
              const isSelected = value === item.dateStr;
              const isTodayCell = todayStr === item.dateStr;
              const isOutOfRange =
                (min && item.dateStr < min) || (max && item.dateStr > max);

              return (
                <button
                  key={`${item.dateStr}-${idx}`}
                  type="button"
                  disabled={Boolean(isOutOfRange)}
                  onClick={() => {
                    if (!isOutOfRange) {
                      onChange(item.dateStr);
                      setIsOpen(false);
                    }
                  }}
                  className={`h-8 rounded-lg flex items-center justify-center font-medium transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-black shadow-glow-emerald'
                      : isTodayCell
                      ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 font-bold'
                      : !item.isCurrentMonth
                      ? 'text-slate-600 hover:bg-slate-900 hover:text-slate-400'
                      : isOutOfRange
                      ? 'opacity-20 cursor-not-allowed text-slate-600'
                      : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          {/* Native HTML input hidden/fallback helper */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <label className="text-slate-400 flex items-center gap-1">
              <Clock size={12} />
              <span>Direct input:</span>
            </label>
            <input
              type="date"
              value={value || ''}
              min={min}
              max={max}
              onChange={(e) => onChange(e.target.value)}
              className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-[11px] focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
