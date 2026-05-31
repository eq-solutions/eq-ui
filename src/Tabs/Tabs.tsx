import React from 'react'
import './Tabs.css'

export interface TabItem {
  /** Stable key returned to `onChange` and matched against `value`. */
  key: string
  /** Visible tab label. */
  label: React.ReactNode
  /** Optional trailing count/badge (e.g. number of open items). */
  count?: number
  /** Disable selection of this tab. */
  disabled?: boolean
}

export interface TabsProps {
  /** Tab definitions, left to right. */
  items: TabItem[]
  /** Key of the currently active tab (controlled). */
  value: string
  /** Fired with the key of the tab the user selects. */
  onChange: (key: string) => void
  /** Accessible label for the tablist. */
  'aria-label'?: string
  /** Additional CSS class on the tablist. */
  className?: string
}

/**
 * EQ canonical tabs — an underline tab strip.
 *
 * Controlled: pass `value` + `onChange`. Renders a proper `role="tablist"` with
 * arrow-key roving focus, so it's keyboard-navigable out of the box. The active
 * tab carries a sky underline; the panels themselves are the consumer's to render.
 *
 * All styling references `--eq-*` custom properties from `@eq-solutions/tokens`.
 *
 * @example
 * <Tabs
 *   value={tab}
 *   onChange={setTab}
 *   items={[
 *     { key: 'all',    label: 'All' },
 *     { key: 'open',   label: 'Open', count: 12 },
 *     { key: 'closed', label: 'Closed' },
 *   ]}
 * />
 */
export function Tabs({
  items,
  value,
  onChange,
  className,
  ['aria-label']: ariaLabel,
}: TabsProps) {
  function moveFocus(currentIdx: number, dir: 1 | -1) {
    const n = items.length
    for (let step = 1; step <= n; step++) {
      const next = items[(currentIdx + dir * step + n) % n]
      if (!next.disabled) {
        onChange(next.key)
        break
      }
    }
  }

  function onKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      moveFocus(idx, 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      moveFocus(idx, -1)
    }
  }

  const classes = ['eq-tabs', className].filter(Boolean).join(' ')

  return (
    <div className={classes} role="tablist" aria-label={ariaLabel}>
      {items.map((item, idx) => {
        const active = item.key === value
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            disabled={item.disabled}
            className={`eq-tabs__tab${active ? ' eq-tabs__tab--active' : ''}`}
            onClick={() => !item.disabled && onChange(item.key)}
            onKeyDown={(e) => onKeyDown(e, idx)}
          >
            {item.label}
            {item.count != null && (
              <span className="eq-tabs__count">{item.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

Tabs.displayName = 'Tabs'
