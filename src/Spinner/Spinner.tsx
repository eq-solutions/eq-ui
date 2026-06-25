import React from 'react'
import './Spinner.css'

export type SpinnerSize = 'sm' | 'md' | 'lg'

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Visual size of the spinner.
   * - `sm` — 14 px, for inline use inside buttons or form fields
   * - `md` — 20 px, default; suits most standalone placements
   * - `lg` — 32 px, for page-level or section-level loading states
   */
  size?: SpinnerSize
  /**
   * Invert fill/track colours for use on dark or primary-coloured backgrounds.
   */
  inverted?: boolean
  /** Accessible label read by screen readers. Defaults to "Loading". */
  label?: string
}

/**
 * EQ canonical indeterminate spinner.
 *
 * Use when an async action is in-flight — submitting a form, saving a record,
 * triggering a server mutation — and you need to signal progress without
 * blocking the full page with a skeleton. Pairs with `<Button>` disabled state.
 *
 * For initial data-load states (skeleton content replacement) use `<Skeleton>`
 * instead.
 *
 * All styling references `--eq-*` custom properties from `@eq-solutions/tokens`.
 *
 * @example
 * // Inside a button
 * <Button disabled>
 *   <Spinner size="sm" inverted /> Saving…
 * </Button>
 *
 * // Standalone section load
 * <Spinner size="md" />
 *
 * // Full-page centred load
 * <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
 *   <Spinner size="lg" label="Loading customers" />
 * </div>
 */
export function Spinner({
  size = 'md',
  inverted = false,
  label = 'Loading',
  className,
  ...props
}: SpinnerProps) {
  const classes = [
    'eq-spinner',
    `eq-spinner--${size}`,
    inverted ? 'eq-spinner--inverted' : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      role="status"
      aria-label={label}
      className={classes}
      {...props}
    />
  )
}

Spinner.displayName = 'Spinner'
