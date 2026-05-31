import React from 'react'
import './StatusBadge.css'

export type StatusKind =
  | 'open'
  | 'in-progress'
  | 'overdue'
  | 'closed'
  | 'await'

const LABELS: Record<StatusKind, string> = {
  open: 'Open',
  'in-progress': 'In progress',
  overdue: 'Overdue',
  closed: 'Closed',
  await: 'Awaiting',
}

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Lifecycle state the badge represents. Drives colour + dot. */
  status: StatusKind
  /** Override the default label text for the status. */
  label?: string
}

/**
 * EQ canonical status badge — a coloured pill with a leading state dot.
 *
 * Status is for *state*, never brand. Each value maps to a fixed token-driven
 * palette so the same state reads identically across Service, Field, Quotes.
 *
 * All styling references `--eq-*` custom properties from `@eq-solutions/tokens`.
 *
 * @example
 * <StatusBadge status="open" />
 * <StatusBadge status="overdue" />
 * <StatusBadge status="closed" label="Done" />
 */
export function StatusBadge({
  status,
  label,
  className,
  ...props
}: StatusBadgeProps) {
  const classes = ['eq-badge', `eq-badge--${status}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes} {...props}>
      <span className="eq-badge__dot" aria-hidden="true" />
      {label ?? LABELS[status]}
    </span>
  )
}

StatusBadge.displayName = 'StatusBadge'
