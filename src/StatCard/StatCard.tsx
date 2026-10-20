import React, { forwardRef } from 'react'
import './StatCard.css'

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Small uppercase label above the value. */
  label: React.ReactNode
  /** The headline figure. */
  value: React.ReactNode
  /** Optional change line, e.g. "▲ 2 vs last week". */
  delta?: React.ReactNode
  /** `'ink'` = dark surface with Sky value; `'white'` = light surface with Ink value. Defaults to `'ink'`. */
  tone?: 'ink' | 'white'
}

/**
 * EQ KPI tile — label, large value, optional delta.
 *
 * @example
 * <StatCard label="Active sites" value="14" delta="▲ 2 vs last week" tone="ink" />
 */
export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(function StatCard(
  { label, value, delta, tone = 'ink', className, ...props },
  ref
) {
  const classes = ['eq-stat', `eq-stat--${tone}`, className].filter(Boolean).join(' ')
  return (
    <div ref={ref} className={classes} {...props}>
      <div className="eq-stat__label">{label}</div>
      <div className="eq-stat__value">{value}</div>
      {delta != null && <div className="eq-stat__delta">{delta}</div>}
    </div>
  )
})

StatCard.displayName = 'StatCard'
