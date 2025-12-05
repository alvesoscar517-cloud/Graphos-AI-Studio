/**
 * Date Picker component with custom calendar
 */

import * as React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/**
 * Custom Calendar component
 */
function Calendar({ selected, onSelect, minDate, maxDate }) {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday)
  const startDay = monthStart.getDay();

  // Create empty cells for days before the first day of month
  const emptyCells = Array(startDay).fill(null);

  const isDisabled = (date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  return (
    <div className="p-3 w-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors text-muted hover:text-primary"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11L5 7l4-4" />
          </svg>
        </button>
        <span className="text-[14px] font-semibold text-primary">
          {format(currentMonth, 'MMMM yyyy', { locale: vi })}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors text-muted hover:text-primary"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 3l4 4-4 4" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-[11px] font-medium text-muted">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {emptyCells.map((_, i) => (
          <div key={`empty-${i}`} className="h-9" />
        ))}
        {days.map((day) => {
          const isSelected = selected && isSameDay(day, selected);
          const isTodayDate = isToday(day);
          const disabled = isDisabled(day);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => !disabled && onSelect(day)}
              disabled={disabled}
              className={cn(
                'h-9 w-full flex items-center justify-center text-[13px] rounded-lg transition-colors',
                'hover:bg-surface-secondary',
                disabled && 'opacity-30 cursor-not-allowed hover:bg-transparent',
                isTodayDate && !isSelected && 'bg-surface-secondary font-semibold',
                isSelected && 'bg-primary text-white hover:bg-primary'
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="text-[12px] text-muted hover:text-primary transition-colors"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => {
            setCurrentMonth(new Date());
            onSelect(new Date());
          }}
          className="text-[12px] text-info hover:text-info/80 transition-colors"
        >
          Today
        </button>
      </div>
    </div>
  );
}

/**
 * Date Picker Input component
 */
function DatePicker({ value, onChange, placeholder = 'Select date', disabled = false, className, minDate, maxDate }) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const handleSelect = (date) => {
    onChange?.(date);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          'flex items-center justify-between w-full h-[42px] px-4 text-[14px] text-left',
          'border border-border/40 rounded-xl bg-surface-secondary transition-all duration-200',
          'hover:bg-surface hover:border-border/60',
          'focus:outline-none focus:bg-surface focus:border-border',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          open && 'bg-surface border-border shadow-[0_0_0_3px_rgba(0,122,255,0.12)]',
          !value && 'text-muted',
          className
        )}
      >
        <span>{value ? format(value, 'dd/MM/yyyy') : placeholder}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-muted"
        >
          <rect x="2" y="3" width="12" height="11" rx="2" />
          <path d="M5 1v3M11 1v3M2 7h12" />
        </svg>
      </button>

      {/* Dropdown calendar */}
      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-surface border border-border/30 rounded-xl shadow-lg">
          <Calendar selected={value} onSelect={handleSelect} minDate={minDate} maxDate={maxDate} />
        </div>
      )}
    </div>
  );
}

/**
 * Date Range Picker - Two date pickers for range selection
 */
function DateRangePicker({
  value,
  onChange,
  placeholderFrom = 'Start date',
  placeholderTo = 'End date',
  disabled = false,
  className,
  minDate,
  maxDate
}) {
  const handleFromChange = (date) => {
    onChange?.({ ...value, from: date });
  };

  const handleToChange = (date) => {
    onChange?.({ ...value, to: date });
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <DatePicker
        value={value?.from}
        onChange={handleFromChange}
        placeholder={placeholderFrom}
        disabled={disabled}
        minDate={minDate}
        maxDate={value?.to || maxDate}
      />
      <span className="text-muted">-</span>
      <DatePicker
        value={value?.to}
        onChange={handleToChange}
        placeholder={placeholderTo}
        disabled={disabled}
        minDate={value?.from || minDate}
        maxDate={maxDate}
      />
    </div>
  );
}

export { DatePicker, DateRangePicker, Calendar };
