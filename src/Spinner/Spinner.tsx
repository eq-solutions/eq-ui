import React from 'react'
import './Spinner.css'

export type SpinnerVariant = 'bars' | 'ring' | 'dots' | 'trail'
export type SpinnerSize = 'sm' | 'md' | 'lg'

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Visual style of the loader.
   *
   * - `bars`  — EQ equalizer bars (default). The signature loader; a nod to
   *   the brand name. Use for full-page / first-paint loads.
   * - `ring`  — single rotating arc. The quiet workhorse for panels and routes.
   * - `dots`  — three pulsing dots. Inline use — buttons, rows, tight spots.
   * - `trail` — a comet ring of fading dots. Premium full-page waits.
   */
  variant?: SpinnerVariant
  /**
   * Footprint of the loader. Defaults to `md`.
   *
   * - `sm` — 16px, inline (text, table rows, beside a label)
   * - `md` — 28px, panel / card loads
   * - `lg` — 40px, full-page / hero loads
   */
  size?: SpinnerSize
  /**
   * Accessible label announced to assistive tech. Defaults to `'Loading'`.
   * The animation itself is `aria-hidden`; this label carries the meaning.
   */
  label?: string
}

const PIECE_COUNT: Record<Exclude<SpinnerVariant, 'ring'>, number> = {
  bars: 5,
  dots: 3,
  trail: 8,
}

/**
 * EQ canonical spinner.
 *
 * An animated loading indicator. The default `bars` variant is the EQ
 * signature — equalizer bars in sky/deep that echo the brand name. Three
 * alternates (`ring`, `dots`, `trail`) cover the rest of the loading
 * vocabulary so apps don't reinvent them.
 *
 * Pure CSS — no JS animation, no bundle cost beyond a few keyframes. All
 * colour and motion reference `--eq-*` custom properties from
 * `@eq-solutions/tokens`; the consuming app must import that CSS so the
 * properties resolve on `:root`. Honours `prefers-reduced-motion`.
 *
 * @example
 * // Default — EQ bars, panel size
 * <Spinner />
 *
 * // Inline beside a label
 * <span>Saving <Spinner variant="dots" size="sm" /></span>
 *
 * // Full-page wait
 * <Spinner variant="trail" size="lg" label="Loading work orders" />
 *
 * // Quiet ring for a route transition
 * <Spinner variant="ring" />
 */
export function Spinner({
  variant = 'bars',
  size = 'md',
  label = 'Loading',
  className,
  ...props
}: SpinnerProps) {
  const classes = [
    'eq-spinner',
    `eq-spinner--${variant}`,
    `eq-spinner--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes} role="status" aria-label={label} {...props}>
      {variant === 'ring' ? (
        <span className="eq-spinner__ring" aria-hidden="true" />
      ) : (
        <span className="eq-spinner__pieces" aria-hidden="true">
          {Array.from({ length: PIECE_COUNT[variant] }).map((_, i) => (
            <span key={i} className="eq-spinner__piece" />
          ))}
        </span>
      )}
    </span>
  )
}

Spinner.displayName = 'Spinner'
