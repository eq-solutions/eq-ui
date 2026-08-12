import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import './MultiSelect.css'

export interface MultiSelectOption {
  value: string
  label: string
  /** Optional colour dot — pass a token, e.g. `'var(--eq-sky)'`. */
  color?: string
}

export interface MultiSelectProps {
  /** Uppercase field label rendered above the trigger. */
  label?: string
  options: MultiSelectOption[]
  /** Selected option values. */
  value: string[]
  onChange: (values: string[]) => void
  /** Text shown in the trigger when nothing is selected. Defaults to `'Any'`. */
  placeholder?: string
  /**
   * Show a search box in the popover once there are more than this many
   * options. Defaults to `8`.
   */
  searchThreshold?: number
  /** Trigger height and popover row padding. Defaults to `'comfortable'`. */
  density?: 'comfortable' | 'compact'
  className?: string
}

/**
 * EQ canonical multi-select — trigger + popover checklist, chips collapse to
 * a count once 3+ are selected. Same click-outside/Escape popover pattern as
 * `DropdownMenu` and `DateRangePicker`.
 *
 * Not a Table internal — a standalone primitive for anywhere a set of
 * discrete values needs picking (a Status/Kind column filter, a form field
 * assigning multiple licences to a worker, and so on).
 *
 * All styling references `--eq-*` custom properties from `@eq-solutions/tokens`.
 *
 * @example
 * <MultiSelect
 *   label="Status"
 *   options={[
 *     { value: 'open', label: 'Open', color: 'var(--eq-sky)' },
 *     { value: 'overdue', label: 'Overdue', color: 'var(--eq-error-text)' },
 *   ]}
 *   value={statuses}
 *   onChange={setStatuses}
 * />
 */
export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
  function MultiSelect(
    {
      label,
      options,
      value,
      onChange,
      placeholder = 'Any',
      searchThreshold = 8,
      density = 'comfortable',
      className,
    },
    ref
  ) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const wrapRef = useRef<HTMLDivElement>(null)

    const close = useCallback(() => {
      setOpen(false)
      setQuery('')
    }, [])

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

    const selected = useMemo(() => new Set(value), [value])

    const filteredOptions = useMemo(() => {
      if (!query) return options
      const q = query.toLowerCase()
      return options.filter((o) => o.label.toLowerCase().includes(q))
    }, [options, query])

    function toggle(optionValue: string) {
      if (selected.has(optionValue)) {
        onChange(value.filter((v) => v !== optionValue))
      } else {
        onChange([...value, optionValue])
      }
    }

    const selectedOptions = useMemo(
      () => options.filter((o) => selected.has(o.value)),
      [options, selected]
    )

    const classes = ['eq-multiselect', className].filter(Boolean).join(' ')

    return (
      <div ref={ref} className={classes} data-density={density}>
        {label && <span className="eq-multiselect__label">{label}</span>}
        <div className="eq-multiselect__wrap" ref={wrapRef}>
          <button
            type="button"
            className="eq-multiselect__trigger"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={open}
          >
            {selectedOptions.length === 0 ? (
              <span className="eq-multiselect__placeholder">{placeholder}</span>
            ) : selectedOptions.length <= 2 ? (
              <span className="eq-multiselect__chips">
                {selectedOptions.map((o) => (
                  <span key={o.value} className="eq-multiselect__chip">
                    {o.color && (
                      <span
                        className="eq-multiselect__dot"
                        style={{ backgroundColor: o.color }}
                        aria-hidden="true"
                      />
                    )}
                    {o.label}
                  </span>
                ))}
              </span>
            ) : (
              <span className="eq-multiselect__count">{selectedOptions.length} selected</span>
            )}
            <ChevronDown size={16} aria-hidden="true" className="eq-multiselect__chevron" />
          </button>

          {open && (
            <div className="eq-multiselect__popover" role="group" aria-label={label ?? 'Options'}>
              {options.length > searchThreshold && (
                <div className="eq-multiselect__search">
                  <Search size={14} aria-hidden="true" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search"
                  />
                </div>
              )}
              <div className="eq-multiselect__options">
                {filteredOptions.length === 0 ? (
                  <div className="eq-multiselect__empty">No matches</div>
                ) : (
                  filteredOptions.map((o) => (
                    <label key={o.value} className="eq-multiselect__option">
                      <input
                        type="checkbox"
                        checked={selected.has(o.value)}
                        onChange={() => toggle(o.value)}
                      />
                      {o.color && (
                        <span
                          className="eq-multiselect__dot"
                          style={{ backgroundColor: o.color }}
                          aria-hidden="true"
                        />
                      )}
                      <span>{o.label}</span>
                    </label>
                  ))
                )}
              </div>
              {selectedOptions.length > 0 && (
                <div className="eq-multiselect__footer">
                  <button
                    type="button"
                    className="eq-multiselect__clear"
                    onClick={() => onChange([])}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
)

MultiSelect.displayName = 'MultiSelect'
