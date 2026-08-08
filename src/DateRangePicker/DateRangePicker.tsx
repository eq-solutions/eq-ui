import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import './DateRangePicker.css'

export interface DateRange {
  start: Date | null
  end: Date | null
}

export interface DateRangePreset {
  label: string
  getRange: () => DateRange
}

function startOfDay(d: Date): Date {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

function endOfDay(d: Date): Date {
  const c = new Date(d)
  c.setHours(23, 59, 59, 999)
  return c
}

function addDays(d: Date, n: number): Date {
  const c = new Date(d)
  c.setDate(c.getDate() + n)
  return c
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
}

function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const DEFAULT_PRESETS: DateRangePreset[] = [
  {
    label: 'Today',
    getRange: () => {
      const t = new Date()
      return { start: startOfDay(t), end: endOfDay(t) }
    },
  },
  {
    label: 'Last 7 days',
    getRange: () => {
      const t = new Date()
      return { start: startOfDay(addDays(t, -6)), end: endOfDay(t) }
    },
  },
  {
    label: 'Last 30 days',
    getRange: () => {
      const t = new Date()
      return { start: startOfDay(addDays(t, -29)), end: endOfDay(t) }
    },
  },
  {
    label: 'This month',
    getRange: () => {
      const t = new Date()
      return { start: startOfMonth(t), end: endOfMonth(t) }
    },
  },
  {
    label: 'Last month',
    getRange: () => {
      const t = new Date()
      const lastMonth = new Date(t.getFullYear(), t.getMonth() - 1, 1)
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
    },
  },
]

const dateFormatter = new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
const monthFormatter = new Intl.DateTimeFormat('en-AU', { month: 'long', year: 'numeric' })
const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function buildMonthGrid(viewMonth: Date): (Date | null)[][] {
  const first = startOfMonth(viewMonth)
  const daysInMonth = endOfMonth(viewMonth).getDate()
  // Monday-first: JS getDay() is 0=Sunday..6=Saturday.
  const leadingBlanks = (first.getDay() + 6) % 7

  const cells: (Date | null)[] = Array.from({ length: leadingBlanks }, () => null)
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day))
  }
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export interface DateRangePickerProps {
  /** Uppercase field label rendered above the trigger. */
  label?: string
  /** Current selected range. Either side may be `null` while a selection is in progress. */
  value: DateRange
  /** Called with the new range once both a start and end date are picked. */
  onChange: (range: DateRange) => void
  /** Quick-select shortcuts shown in the popover. Defaults to Today / Last 7 days / Last 30 days / This month / Last month. */
  presets?: DateRangePreset[]
  /** Text shown in the trigger when no range is selected. */
  placeholder?: string
  /** Earliest selectable date, inclusive. */
  min?: Date
  /** Latest selectable date, inclusive. */
  max?: Date
  /** Trigger height and calendar cell size. Defaults to `'comfortable'`. */
  density?: 'comfortable' | 'compact'
  className?: string
}

/**
 * EQ canonical date-range picker — trigger + popover calendar, no external
 * date library (native `Date` + `Intl.DateTimeFormat` only).
 *
 * Click a start day, then an end day — the range commits and the popover
 * closes on the second click. Picking a day before the current start
 * restarts the selection from there. Presets fill both sides at once.
 *
 * All styling references `--eq-*` custom properties from `@eq-solutions/tokens`.
 *
 * @example
 * const [range, setRange] = useState<DateRange>({ start: null, end: null })
 * <DateRangePicker label="Date range" value={range} onChange={setRange} />
 *
 * // compact — dense Field surfaces
 * <DateRangePicker value={range} onChange={setRange} density="compact" />
 */
export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
  function DateRangePicker(
    {
      label,
      value,
      onChange,
      presets = DEFAULT_PRESETS,
      placeholder = 'Select date range',
      min,
      max,
      density = 'comfortable',
      className,
    },
    ref
  ) {
    const [open, setOpen] = useState(false)
    const [viewMonth, setViewMonth] = useState(() => startOfMonth(value.start ?? new Date()))
    const [pendingStart, setPendingStart] = useState<Date | null>(value.start)
    const wrapRef = useRef<HTMLDivElement>(null)

    const close = useCallback(() => setOpen(false), [])

    useEffect(() => {
      if (!open) return
      setPendingStart(value.start)
      setViewMonth(startOfMonth(value.start ?? new Date()))
    }, [open, value.start])

    useEffect(() => {
      if (!open) return
      function onKey(e: KeyboardEvent) {
        if (e.key === 'Escape') close()
      }
      function onDown(e: MouseEvent) {
        if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close()
      }
      document.addEventListener('keydown', onKey)
      document.addEventListener('mousedown', onDown)
      return () => {
        document.removeEventListener('keydown', onKey)
        document.removeEventListener('mousedown', onDown)
      }
    }, [open, close])

    const weeks = useMemo(() => buildMonthGrid(viewMonth), [viewMonth])

    const isDisabled = useCallback(
      (day: Date) => (min != null && day < startOfDay(min)) || (max != null && day > endOfDay(max)),
      [min, max]
    )

    function handleDayClick(day: Date) {
      if (isDisabled(day)) return
      if (!pendingStart || (value.start && value.end)) {
        setPendingStart(day)
        onChange({ start: day, end: null })
        return
      }
      if (day < pendingStart) {
        setPendingStart(day)
        onChange({ start: day, end: null })
        return
      }
      onChange({ start: pendingStart, end: day })
      setOpen(false)
    }

    function handlePreset(preset: DateRangePreset) {
      const range = preset.getRange()
      onChange(range)
      setPendingStart(range.start)
      setViewMonth(startOfMonth(range.start ?? new Date()))
      setOpen(false)
    }

    function handleClear(e: React.MouseEvent) {
      e.stopPropagation()
      onChange({ start: null, end: null })
      setPendingStart(null)
    }

    const displayText =
      value.start && value.end
        ? `${dateFormatter.format(value.start)} – ${dateFormatter.format(value.end)}`
        : value.start
          ? dateFormatter.format(value.start)
          : placeholder

    const rangeStart = pendingStart ?? value.start
    const rangeEnd = value.end

    const classes = ['eq-daterange', className].filter(Boolean).join(' ')

    return (
      <div ref={ref} className={classes} data-density={density}>
        {label && <span className="eq-daterange__label">{label}</span>}
        <div className="eq-daterange__wrap" ref={wrapRef}>
          <button
            type="button"
            className="eq-daterange__trigger"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            <Calendar size={15} aria-hidden="true" className="eq-daterange__icon" />
            <span className={`eq-daterange__text${!value.start ? ' eq-daterange__text--placeholder' : ''}`}>
              {displayText}
            </span>
          </button>
          {(value.start || value.end) && (
            <button
              type="button"
              className="eq-daterange__clear"
              aria-label="Clear date range"
              onClick={handleClear}
            >
              <X size={13} aria-hidden="true" />
            </button>
          )}

          {open && (
            <div className="eq-daterange__popover" role="dialog" aria-label="Choose date range">
              <div className="eq-daterange__presets">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    className="eq-daterange__preset"
                    onClick={() => handlePreset(preset)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="eq-daterange__calendar">
                <div className="eq-daterange__nav">
                  <button
                    type="button"
                    className="eq-daterange__nav-btn"
                    onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={16} aria-hidden="true" />
                  </button>
                  <span className="eq-daterange__month">{monthFormatter.format(viewMonth)}</span>
                  <button
                    type="button"
                    className="eq-daterange__nav-btn"
                    onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                    aria-label="Next month"
                  >
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                </div>

                <div className="eq-daterange__weekdays">
                  {WEEKDAY_LABELS.map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>

                {weeks.map((week, wi) => (
                  <div className="eq-daterange__week" key={wi}>
                    {week.map((day, di) => {
                      if (!day) return <span key={di} className="eq-daterange__day eq-daterange__day--blank" />
                      const isStart = isSameDay(day, rangeStart)
                      const isEnd = isSameDay(day, rangeEnd)
                      const inRange =
                        rangeStart != null && rangeEnd != null && day > rangeStart && day < rangeEnd
                      const today = isSameDay(day, new Date())
                      return (
                        <button
                          key={di}
                          type="button"
                          className="eq-daterange__day"
                          data-selected={isStart || isEnd ? 'true' : undefined}
                          data-in-range={inRange ? 'true' : undefined}
                          aria-pressed={isStart || isEnd}
                          aria-current={today ? 'date' : undefined}
                          disabled={isDisabled(day)}
                          onClick={() => handleDayClick(day)}
                        >
                          {day.getDate()}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
)

DateRangePicker.displayName = 'DateRangePicker'
