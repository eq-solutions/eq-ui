import React, { useEffect, useId, useState } from 'react'
import './Tooltip.css'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  /** Tooltip text or rich content. */
  content: React.ReactNode
  /** The single element the tooltip is attached to. Must accept a ref-free clone (props only). */
  children: React.ReactElement
  /** Side the tooltip opens on. Defaults to 'top'. */
  placement?: TooltipPlacement
}

/**
 * EQ canonical tooltip — Ink background, appears on hover/focus.
 *
 * No delay, no bounce: motion is a plain 150ms fade per the EQ animation
 * brief. Wraps a single focusable child and associates it with the tooltip
 * via aria-describedby so screen readers announce it on focus too.
 *
 * All styling references `--eq-*` custom properties from `@eq-solutions/tokens`.
 *
 * @example
 * <Tooltip content="Runs a compliance check">
 *   <Button variant="ghost" size="sm">Check</Button>
 * </Tooltip>
 */
export function Tooltip({ content, children, placement = 'top' }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const id = useId()

  const show = () => setOpen(true)
  const hide = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') hide()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <span
      className="eq-tooltip"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {React.cloneElement(children, {
        'aria-describedby': open ? id : undefined,
      } as React.HTMLAttributes<HTMLElement>)}
      {open && (
        <span
          role="tooltip"
          id={id}
          className={`eq-tooltip__bubble eq-tooltip__bubble--${placement}`}
        >
          {content}
        </span>
      )}
    </span>
  )
}

Tooltip.displayName = 'Tooltip'
