import React, { forwardRef } from 'react'
import './EmptyState.css'

export interface EmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Small illustrative icon or glyph, centered above the title. */
  icon?: React.ReactNode
  /** Direct, one-line statement of what's missing. */
  title: string
  /** Optional supporting copy — one sentence, no fluff. */
  description?: string
  /** The one clear next step, usually a <Button>. */
  action?: React.ReactNode
}

/**
 * EQ canonical empty state — direct copy, one clear next step.
 *
 * Matches the brief's voice guidance directly (e.g. "No job numbers added
 * yet"). Never pads with illustration; a single glyph is enough.
 *
 * All styling references `--eq-*` custom properties from `@eq-solutions/tokens`.
 *
 * @example
 * <EmptyState
 *   title="No job numbers added yet"
 *   description="Job numbers you add will show up here for the whole team."
 *   action={<Button size="sm">Add job number</Button>}
 * />
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState({ icon, title, description, action, className, ...props }, ref) {
    const classes = ['eq-empty', className].filter(Boolean).join(' ')

    return (
      <div ref={ref} className={classes} {...props}>
        {icon != null && (
          <div className="eq-empty__icon" aria-hidden="true">
            {icon}
          </div>
        )}
        <div className="eq-empty__title">{title}</div>
        {description != null && <div className="eq-empty__description">{description}</div>}
        {action != null && <div className="eq-empty__action">{action}</div>}
      </div>
    )
  }
)

EmptyState.displayName = 'EmptyState'
