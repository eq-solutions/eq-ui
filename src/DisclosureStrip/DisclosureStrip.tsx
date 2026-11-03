import React, { forwardRef, useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import './DisclosureStrip.css'

export interface DisclosureStripProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** Bold title shown in the collapsed line. */
  title: string
  /** Optional count shown after the title. */
  count?: number
  /** Dot colour: `'attention'` (amber, default) or `'info'` (sky). */
  tone?: 'attention' | 'info'
  /** Initial open state when uncontrolled. Defaults to `false`. */
  defaultOpen?: boolean
  /** Controlled open state. When set, the strip never toggles itself. */
  open?: boolean
  /** Fired with the requested open state on every toggle. */
  onOpenChange?: (open: boolean) => void
  /** Content revealed when the strip is expanded. */
  children?: React.ReactNode
}

/**
 * EQ canonical disclosure strip — one quiet line that expands to a list.
 *
 * Collapsed it is a single low-key row (dot, bold title, count, chevron); the
 * header is a real `<button aria-expanded aria-controls>` so Enter and Space
 * toggle it natively. The panel is always rendered (`hidden` when closed) so
 * `aria-controls` stays valid and children keep their state.
 *
 * Uncontrolled by default (`defaultOpen`); pass `open` + `onOpenChange` to
 * control it.
 *
 * Flat by design: no gradient, no shadow. All styling references `--eq-*`
 * custom properties from `@eq-solutions/tokens`.
 *
 * @example
 * <DisclosureStrip title="Needs attention" count={3}>
 *   <ul>…</ul>
 * </DisclosureStrip>
 */
export const DisclosureStrip = forwardRef<HTMLDivElement, DisclosureStripProps>(
  function DisclosureStrip(
    {
      title,
      count,
      tone = 'attention',
      defaultOpen = false,
      open: openProp,
      onOpenChange,
      className,
      children,
      ...props
    },
    ref
  ) {
    const [openState, setOpenState] = useState(defaultOpen)
    const isControlled = openProp !== undefined
    const open = isControlled ? openProp : openState
    const uid = useId()
    const buttonId = `${uid}-button`
    const panelId = `${uid}-panel`

    function toggle() {
      const next = !open
      if (!isControlled) setOpenState(next)
      onOpenChange?.(next)
    }

    const classes = ['eq-disclosure-strip', `eq-disclosure-strip--${tone}`, className]
      .filter(Boolean)
      .join(' ')

    return (
      <div ref={ref} className={classes} data-open={open} {...props}>
        <button
          type="button"
          id={buttonId}
          className="eq-disclosure-strip__header"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}
        >
          <span className="eq-disclosure-strip__dot" aria-hidden="true" />
          <span className="eq-disclosure-strip__title">{title}</span>
          {count != null && <span className="eq-disclosure-strip__count">{count}</span>}
          <ChevronDown className="eq-disclosure-strip__chevron" size={14} aria-hidden="true" />
        </button>
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="eq-disclosure-strip__panel"
          hidden={!open}
        >
          {children}
        </div>
      </div>
    )
  }
)

DisclosureStrip.displayName = 'DisclosureStrip'
