import React, { forwardRef } from 'react'
import './Card.css'

export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional heading shown in the card header row. */
  title?: React.ReactNode
  /** Optional right-aligned header content (buttons, filters, meta). */
  actions?: React.ReactNode
  /**
   * Inner padding tier. Defaults to `'md'`.
   * Use `'none'` when the card wraps an edge-to-edge element (e.g. a `<Table>`).
   */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Colour-coded left edge, e.g. Field site status. Omit for no band. */
  band?: 'sky' | 'success' | 'warning' | 'error' | 'grey'
}

const BAND_VAR: Record<NonNullable<CardProps['band']>, string> = {
  sky: 'var(--eq-sky)',
  success: 'var(--eq-success-dot, var(--eq-success-text))',
  warning: 'var(--eq-warning-dot, var(--eq-warning-text))',
  error: 'var(--eq-error-dot, var(--eq-error-text))',
  grey: 'var(--eq-gray-400)',
}

/**
 * EQ canonical surface card — a bordered white container.
 *
 * Flat by design: no shadow (only floating UI — Modal, Toast — gets a shadow).
 * Pass `title`/`actions` to get a standard header row, or omit both for a plain
 * padded surface.
 *
 * All styling references `--eq-*` custom properties from `@eq-solutions/tokens`.
 *
 * @example
 * <Card title="Work orders" actions={<Button size="sm">New</Button>}>
 *   …
 * </Card>
 *
 * // edge-to-edge table
 * <Card padding="none"><Table … /></Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { title, actions, padding = 'md', band, className, style, children, ...props },
  ref
) {
  const hasHeader = title != null || actions != null
  const classes = ['eq-card', `eq-card--pad-${padding}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={ref}
      className={classes}
      data-band={band}
      style={
        band
          ? ({ '--eq-band-color': BAND_VAR[band], ...style } as React.CSSProperties)
          : style
      }
      {...props}
    >
      {hasHeader && (
        <div className="eq-card__header">
          {title != null && <h3 className="eq-card__title">{title}</h3>}
          {actions != null && <div className="eq-card__actions">{actions}</div>}
        </div>
      )}
      <div className="eq-card__body">{children}</div>
    </div>
  )
})

Card.displayName = 'Card'
