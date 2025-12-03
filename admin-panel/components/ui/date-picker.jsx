/**
 * Date Picker component using react-day-picker
 * Lightweight, accessible date selection
 */

import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { vi } from 'date-fns/locale'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './dialog'

/**
 * Calendar component
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-4', className)}
      locale={vi}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-[15px] font-semibold text-primary tracking-[-0.01em]',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          'h-8 w-8 bg-transparent p-0 text-muted hover:text-primary hover:bg-surface-secondary/80 rounded-xl transition-all duration-150',
          'inline-flex items-center justify-center'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-muted rounded-xl w-10 font-medium text-[12px]',
        row: 'flex w-full mt-2',
        cell: cn(
          'relative p-0 text-center text-[14px] focus-within:relative focus-within:z-20',
          '[&:has([aria-selected])]:bg-surface-secondary/60 [&:has([aria-selected].day-outside)]:bg-surface-secondary/30',
          '[&:has([aria-selected].day-range-end)]:rounded-r-xl'
        ),
        day: cn(
          'h-10 w-10 p-0 font-normal',
          'inline-flex items-center justify-center rounded-xl transition-all duration-150',
          'hover:bg-surface-secondary/80 hover:text-primary',
          'focus:outline-none focus-visible:ring-[3px] focus-visible:ring-info/25',
          'aria-selected:opacity-100'
        ),
        day_range_start: 'day-range-start',
        day_range_end: 'day-range-end',
        day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
        day_today: 'bg-info/10 text-info font-semibold',
        day_outside: 'day-outside text-muted opacity-50 aria-selected:bg-surface-secondary/30 aria-selected:text-muted',
        day_disabled: 'text-muted opacity-40',
        day_range_middle: 'aria-selected:bg-surface-secondary/60 aria-selected:text-primary',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: () => (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 12L6 8l4-4" />
          </svg>
        ),
        IconRight: () => (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 4l4 4-4 4" />
          </svg>
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'


/**
 * Date Picker Input component
 */
function DatePicker({
  value,
  onChange,
  placeholder = 'Chọn ngày',
  disabled = false,
  className,
  minDate,
  maxDate,
}) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (date) => {
    onChange?.(date)
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        className={cn(
          'flex items-center justify-between w-full px-4 py-3 text-[15px] text-left',
          'border border-border/40 rounded-xl bg-surface-secondary transition-all duration-200',
          'hover:bg-surface hover:border-border/60',
          'focus:outline-none focus:bg-surface focus:border-border focus:shadow-[0_0_0_3px_rgba(0,122,255,0.12)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          !value && 'text-muted',
          className
        )}
      >
        <span>{value ? format(value, 'dd/MM/yyyy') : placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
          <rect x="2" y="3" width="12" height="11" rx="2" />
          <path d="M5 1v3M11 1v3M2 7h12" />
        </svg>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-fit p-0">
          <DialogHeader className="px-4 pt-4 pb-0 mb-0">
            <DialogTitle>Chọn ngày</DialogTitle>
          </DialogHeader>
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            disabled={(date) => {
              if (minDate && date < minDate) return true
              if (maxDate && date > maxDate) return true
              return false
            }}
            initialFocus
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * Date Range Picker component
 */
function DateRangePicker({
  value,
  onChange,
  placeholder = 'Chọn khoảng thời gian',
  disabled = false,
  className,
  minDate,
  maxDate,
  presets,
}) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (range) => {
    onChange?.(range)
    if (range?.from && range?.to) {
      setOpen(false)
    }
  }

  const formatRange = () => {
    if (!value?.from) return placeholder
    if (!value?.to) return format(value.from, 'dd/MM/yyyy')
    return `${format(value.from, 'dd/MM/yyyy')} - ${format(value.to, 'dd/MM/yyyy')}`
  }

  return (
    <>
      <button
        type="button"
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        className={cn(
          'flex items-center justify-between w-full px-4 py-3 text-[15px] text-left',
          'border border-border/40 rounded-xl bg-surface-secondary transition-all duration-200',
          'hover:bg-surface hover:border-border/60',
          'focus:outline-none focus:bg-surface focus:border-border focus:shadow-[0_0_0_3px_rgba(0,122,255,0.12)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          !value?.from && 'text-muted',
          className
        )}
      >
        <span>{formatRange()}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
          <rect x="2" y="3" width="12" height="11" rx="2" />
          <path d="M5 1v3M11 1v3M2 7h12" />
        </svg>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-fit p-0">
          <DialogHeader className="px-4 pt-4 pb-0 mb-0">
            <DialogTitle>Chọn khoảng thời gian</DialogTitle>
          </DialogHeader>
          <div className="flex">
            {presets && (
              <div className="border-r border-border/40 p-3 space-y-1">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      onChange?.(preset.value)
                      setOpen(false)
                    }}
                    className="w-full px-3.5 py-2.5 text-[14px] text-left rounded-xl hover:bg-surface-secondary/80 transition-all duration-150"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}
            <Calendar
              mode="range"
              selected={value}
              onSelect={handleSelect}
              numberOfMonths={2}
              disabled={(date) => {
                if (minDate && date < minDate) return true
                if (maxDate && date > maxDate) return true
                return false
              }}
              initialFocus
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export { Calendar, DatePicker, DateRangePicker }
