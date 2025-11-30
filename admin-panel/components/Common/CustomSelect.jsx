import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function CustomSelect({ value, onChange, options, label, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  return (
    <div className={cn("relative inline-block", className)} ref={selectRef}>
      {label && (
        <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-2">
          {label}
        </label>
      )}
      <div 
        className={cn(
          "flex items-center justify-between gap-2 px-4 py-2.5 bg-surface border border-border rounded-lg",
          "text-sm text-primary cursor-pointer transition-all hover:border-primary min-w-[140px]",
          isOpen && "border-primary"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label || 'Select...'}</span>
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 12 12" 
          className={cn("transition-transform duration-200", isOpen && "rotate-180")}
        >
          <path fill="currentColor" d="M6 9L1 4h10z"/>
        </svg>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {options.map((option) => (
            <div
              key={option.value}
              className={cn(
                "px-4 py-2.5 text-sm text-primary cursor-pointer transition-colors hover:bg-surface-secondary",
                option.value === value && "bg-surface-secondary font-medium"
              )}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
