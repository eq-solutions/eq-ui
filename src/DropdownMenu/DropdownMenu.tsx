import { useState, useRef, useEffect, useCallback, useId } from 'react'
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
  /** Small secondary line under the label; announced as the item description. */
  hint?: string
  /**
   * When defined, the item becomes a checkbox menuitem (`role="menuitemcheckbox"`,
   * `aria-checked`) with a leading check indicator.
   */
  checked?: boolean
  /** Click runs `onClick` but leaves the menu open. Defaults to false. */
  keepOpen?: boolean
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
  /** Menu item padding. Defaults to `'comfortable'`. */
  density?: 'comfortable' | 'compact'
}

function isSeparator(e: DropdownMenuEntry): e is DropdownMenuSeparatorDef {
  return 'separator' in e && e.separator === true
}

/**
 * EQ canonical dropdown menu.
 *
 * Wrap any trigger element — commonly an icon button with `⋯` or a lucide
 * `MoreHorizontal`. The menu closes on item click (unless the item sets
 * `keepOpen`), Escape, or click-outside. ArrowDown/ArrowUp/Home/End move focus
 * between items; Escape and item selection return focus to the trigger.
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
export function DropdownMenu({
  trigger,
  items,
  align = 'right',
  density = 'comfortable',
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const pendingFocus = useRef<'first' | 'last' | null>(null)
  const baseId = useId()

  const close = useCallback(() => setOpen(false), [])

  const focusTrigger = useCallback(() => {
    wrapRef.current
      ?.querySelector('.eq-dropdown__trigger')
      ?.querySelector<HTMLElement>(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      ?.focus()
  }, [])

  const enabledItems = useCallback(
    () =>
      Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not(:disabled)') ?? []
      ),
    []
  )

  useEffect(() => {
    if (!open || !pendingFocus.current) return
    const list = enabledItems()
    ;(pendingFocus.current === 'first' ? list[0] : list[list.length - 1])?.focus()
    pendingFocus.current = null
  }, [open, enabledItems])

  function onWrapKeyDown(e: React.KeyboardEvent) {
    const inMenu = menuRef.current?.contains(e.target as Node)
    if (!inMenu) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        if (open) {
          const list = enabledItems()
          ;(e.key === 'ArrowDown' ? list[0] : list[list.length - 1])?.focus()
        } else {
          pendingFocus.current = e.key === 'ArrowDown' ? 'first' : 'last'
          setOpen(true)
        }
      }
      return
    }
    const list = enabledItems()
    if (list.length === 0) return
    const i = list.indexOf(e.target as HTMLElement)
    let next: HTMLElement | undefined
    if (e.key === 'ArrowDown') next = list[(i + 1) % list.length]
    else if (e.key === 'ArrowUp') next = list[(i - 1 + list.length) % list.length]
    else if (e.key === 'Home') next = list[0]
    else if (e.key === 'End') next = list[list.length - 1]
    else return
    e.preventDefault()
    next?.focus()
  }

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      close()
      focusTrigger()
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
  }, [open, close, focusTrigger])

  return (
    // Keydown here only handles arrow navigation bubbling up from the trigger and items.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className="eq-dropdown" ref={wrapRef} data-density={density} onKeyDown={onWrapKeyDown}>
      {/* `trigger` is documented + expected to be a native focusable control (e.g. a
          <button>); keyboard activation already works via native click-on-Enter/Space
          bubbling up to this wrapper. Adding our own onKeyDown here would double-fire
          for any trigger that already handles its own keyboard activation. */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
        className="eq-dropdown__trigger"
      >
        {trigger}
      </div>
      {open && (
        <div
          ref={menuRef}
          className={`eq-dropdown__menu eq-dropdown__menu--${align}`}
          role="menu"
          aria-orientation="vertical"
        >
          {items.map((entry) => {
            if (isSeparator(entry)) {
              return <div key={entry.key} className="eq-dropdown__sep" role="separator" />
            }
            const isCheckbox = entry.checked !== undefined
            const hintId = entry.hint ? `${baseId}-${entry.key}-hint` : undefined
            return (
              <button
                key={entry.key}
                type="button"
                className={`eq-dropdown__item${entry.variant === 'danger' ? ' eq-dropdown__item--danger' : ''}`}
                role={isCheckbox ? 'menuitemcheckbox' : 'menuitem'}
                aria-checked={isCheckbox ? entry.checked : undefined}
                aria-describedby={hintId}
                disabled={entry.disabled}
                onClick={() => {
                  if (!entry.keepOpen) {
                    close()
                    focusTrigger()
                  }
                  entry.onClick()
                }}
              >
                {isCheckbox && (
                  <span className="eq-dropdown__check" aria-hidden="true">
                    {entry.checked && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.5 7.5l3 3 6-6.5" />
                      </svg>
                    )}
                  </span>
                )}
                {entry.icon && (
                  <span className="eq-dropdown__icon" aria-hidden="true">{entry.icon}</span>
                )}
                {entry.hint ? (
                  <span className="eq-dropdown__text">
                    <span className="eq-dropdown__label">{entry.label}</span>
                    <span className="eq-dropdown__hint" id={hintId}>{entry.hint}</span>
                  </span>
                ) : (
                  entry.label
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

DropdownMenu.displayName = 'DropdownMenu'
