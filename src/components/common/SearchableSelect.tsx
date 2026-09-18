import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, Plus } from 'lucide-react';

export interface SelectOption {
  id: string;
  value?: string; // Fallback to id or label
  label: string;
  subLabel?: string;
  icon?: string | React.ReactNode;
  group?: string;
  badge?: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
  allowCustom?: boolean;
  customButtonText?: string;
  className?: string;
  id?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  label,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search option (தேடு)...',
  required = false,
  disabled = false,
  allowCustom = true,
  customButtonText,
  className = '',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return (
      options.find(
        (opt) =>
          opt.id === value ||
          (opt.value && opt.value === value) ||
          opt.label === value
      ) || null
    );
  }, [options, value]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(q);
      const matchSub = opt.subLabel ? opt.subLabel.toLowerCase().includes(q) : false;
      const matchGroup = opt.group ? opt.group.toLowerCase().includes(q) : false;
      return matchLabel || matchSub || matchGroup;
    });
  }, [options, searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto focus search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option: SelectOption) => {
    const chosenVal = option.value || option.label || option.id;
    onChange(chosenVal);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleUseCustom = () => {
    if (!searchQuery.trim()) return;
    onChange(searchQuery.trim());
    setIsOpen(false);
    setSearchQuery('');
  };

  // Group options if applicable
  const groupedOptions = useMemo(() => {
    const groups: { [key: string]: SelectOption[] } = {};
    const ungrouped: SelectOption[] = [];

    filteredOptions.forEach((opt) => {
      if (opt.group) {
        if (!groups[opt.group]) groups[opt.group] = [];
        groups[opt.group].push(opt);
      } else {
        ungrouped.push(opt);
      }
    });

    return { groups, ungrouped };
  }, [filteredOptions]);

  const renderIcon = (icon: string | React.ReactNode) => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <span className="text-base select-none shrink-0">{icon}</span>;
    }
    return <span className="shrink-0">{icon}</span>;
  };

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
        <div className="flex items-center gap-2 truncate pr-2">
          {selectedOption ? (
            <>
              {renderIcon(selectedOption.icon)}
              <div className="truncate text-left">
                <span className="font-semibold text-slate-100">
                  {selectedOption.label}
                </span>
                {selectedOption.subLabel && (
                  <span className="text-[10px] text-slate-400 ml-1.5 font-normal">
                    ({selectedOption.subLabel})
                  </span>
                )}
              </div>
            </>
          ) : value ? (
            <span className="font-semibold text-slate-100 truncate">{value}</span>
          ) : (
            <span className="text-slate-400 truncate">{placeholder}</span>
          )}
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
              title="Clear selection"
            >
              <X size={12} />
            </button>
          )}
          <ChevronDown
            size={15}
            className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-400' : ''}`}
          />
        </div>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 left-0 right-0 w-full min-w-[280px] p-2 rounded-2xl bg-slate-950 border border-emerald-500/30 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-2 max-h-80 flex flex-col">
          {/* Search Input */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredOptions.length > 0) {
                    handleSelect(filteredOptions[0]);
                  } else if (allowCustom && searchQuery.trim()) {
                    handleUseCustom();
                  }
                } else if (e.key === 'Escape') {
                  setIsOpen(false);
                }
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
            {/* Ungrouped options */}
            {groupedOptions.ungrouped.map((opt) => {
              const isSelected =
                value === opt.id ||
                (opt.value && value === opt.value) ||
                value === opt.label;

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => handleSelect(opt)}
                  className={`flex items-center justify-between w-full p-2 rounded-xl text-xs transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : opt.disabled
                      ? 'opacity-40 cursor-not-allowed text-slate-500'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {renderIcon(opt.icon)}
                    <div className="truncate">
                      <span className={isSelected ? 'text-white' : 'text-slate-200'}>
                        {opt.label}
                      </span>
                      {opt.subLabel && (
                        <span
                          className={`text-[10px] ml-1.5 ${
                            isSelected ? 'text-emerald-100' : 'text-slate-400'
                          }`}
                        >
                          {opt.subLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {opt.badge && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>
                </button>
              );
            })}

            {/* Grouped options */}
            {Object.entries(groupedOptions.groups).map(([groupTitle, groupItems]) => (
              <div key={groupTitle} className="pt-1.5 space-y-1">
                <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 rounded-md">
                  {groupTitle}
                </div>
                {groupItems.map((opt) => {
                  const isSelected =
                    value === opt.id ||
                    (opt.value && value === opt.value) ||
                    value === opt.label;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => handleSelect(opt)}
                      className={`flex items-center justify-between w-full p-2 rounded-xl text-xs transition cursor-pointer text-left ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-bold shadow-sm'
                          : opt.disabled
                          ? 'opacity-40 cursor-not-allowed text-slate-500'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {renderIcon(opt.icon)}
                        <div className="truncate">
                          <span className={isSelected ? 'text-white' : 'text-slate-200'}>
                            {opt.label}
                          </span>
                          {opt.subLabel && (
                            <span
                              className={`text-[10px] ml-1.5 ${
                                isSelected ? 'text-emerald-100' : 'text-slate-400'
                              }`}
                            >
                              {opt.subLabel}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {opt.badge && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                            {opt.badge}
                          </span>
                        )}
                        {isSelected && <Check size={14} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}

            {/* No items found / Custom Add */}
            {filteredOptions.length === 0 && (
              <div className="p-3 text-center space-y-2">
                <div className="text-xs text-slate-400">
                  No matching options for "{searchQuery}"
                </div>
                {allowCustom && searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={handleUseCustom}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>{customButtonText || `Use "${searchQuery.trim()}"`}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
