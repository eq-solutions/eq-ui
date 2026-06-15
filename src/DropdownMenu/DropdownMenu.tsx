import { useState, useRef, useEffect, useCallback } from 'react'
import './DropdownMenu.css'

export interface DropdownMenuItemDef {
  key: string
  label: string
  /** Lucide icon at 14px. */
  icon?: React.ReactNode
  onClick: () => void
  disabled?: boolean
  /** 'danger' renders in red. */
  variant?: 'default' | 'danger'
}

export interface DropdownMenuSeparatorDef {
  key: string
  separator: true
}

export type DropdownMenuEntry = DropdownMenuItemDef | DropdownMenuSeparatorDef

export interface DropdownMenuProps {
  /** The button or element that opens the menu. */
  trigger: React.ReactNode
  items: DropdownMenuEntry[]
  /** Which edge to align the menu to. Defaults to 'right'. */
  align?: 'left' | 'right'
}

function isSeparator(e: DropdownMenuEntry): e is DropdownMenuSeparatorDef {
  return 'separator' in e && e.separator === true
}

/**
 * EQ canonical dropdown menu.
 *
 * Wrap any trigger element — commonly an icon button with `⋯` or a lucide
 * `MoreHorizontal`. The menu closes on item click, Escape, or click-outside.
 *
 * @example
 * <DropdownMenu
 *   trigger={<button className="eq-btn eq-btn--ghost eq-btn--sm" aria-label="More">⋯</button>}
 *   items={[
 *     { key: 'dup',   label: 'Duplicate',      icon: <Copy size={14} />, onClick: handleDuplicate },
 *     { key: 'sep',   separator: true },
 *     { key: 'trash', label: 'Move to trash',  icon: <Trash2 size={14} />, onClick: handleTrash, variant: 'danger' },
 *   ]}
 * />
 */
export function DropdownMenu({ trigger, items, align = 'right' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close() }
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

  return (
    <div className="eq-dropdown" ref={wrapRef}>
      <div
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
        className="eq-dropdown__trigger"
      >
        {trigger}
      </div>
      {open && (
        <div
          className={`eq-dropdown__menu eq-dropdown__menu--${align}`}
          role="menu"
          aria-orientation="vertical"
        >
          {items.map((entry) =>
            isSeparator(entry) ? (
              <div key={entry.key} className="eq-dropdown__sep" role="separator" />
            ) : (
              <button
                key={entry.key}
                className={`eq-dropdown__item${entry.variant === 'danger' ? ' eq-dropdown__item--danger' : ''}`}
                role="menuitem"
                disabled={entry.disabled}
                onClick={() => { close(); entry.onClick() }}
              >
                {entry.icon && (
                  <span className="eq-dropdown__icon" aria-hidden="true">{entry.icon}</span>
                )}
                {entry.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

DropdownMenu.displayName = 'DropdownMenu'
