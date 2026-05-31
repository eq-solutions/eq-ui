import React from 'react'
import './KindPill.css'

export type WorkKind = 'preventive' | 'corrective' | 'inspection'

const LABELS: Record<WorkKind, string> = {
  preventive: 'Preventive',
  corrective: 'Corrective',
  inspection: 'Inspection',
}

export interface KindPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Work-order kind. Drives the bordered pill style + dot. */
  kind: WorkKind
  /** Override the default label text for the kind. */
  label?: string
}

/**
 * EQ canonical kind pill — a bordered tag classifying a work order by type.
 *
 * Distinct from `StatusBadge`: kind is a *category* (preventive / corrective /
 * inspection), not a lifecycle state, so it uses a quieter bordered treatment.
 *
 * All styling references `--eq-*` custom properties from `@eq-solutions/tokens`.
 *
 * @example
 * <KindPill kind="preventive" />
 * <KindPill kind="corrective" />
 * <KindPill kind="inspection" label="Audit" />
 */
export function KindPill({ kind, label, className, ...props }: KindPillProps) {
  const classes = ['eq-kind', `eq-kind--${kind}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes} {...props}>
      <span className="eq-kind__dot" aria-hidden="true" />
      {label ?? LABELS[kind]}
    </span>
  )
}

KindPill.displayName = 'KindPill'
