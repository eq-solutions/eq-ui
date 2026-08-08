import React, { forwardRef } from 'react'
import { AlertTriangle, Lock, SearchX } from 'lucide-react'
import './EmptyState.css'

export type EmptyStateVariant = 'default' | 'filtered' | 'error' | 'no-access'

const VARIANT_ICON: Record<Exclude<EmptyStateVariant, 'default'>, React.ReactNode> = {
  filtered: <SearchX size={18} aria-hidden="true" />,
  error: <AlertTriangle size={18} aria-hidden="true" />,
  'no-access': <Lock size={18} aria-hidden="true" />,
}

export interface EmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Preset that supplies a default icon and tone. Defaults to `'default'`
   * (no icon unless one is passed, neutral tone) — matches the original
   * unstyled empty state exactly, so existing usage is unaffected.
   *
   * - `filtered`   — a search/filter returned nothing. Neutral tone.
   * - `error`      — the data failed to load. Red tone, use with a retry action.
   * - `no-access`  — the user lacks permission. Neutral tone.
   *
   * An explicit `icon` prop always overrides the variant's default icon.
   */
  variant?: EmptyStateVariant
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
 *
 * // Filtered-out result set
 * <EmptyState
 *   variant="filtered"
 *   title="No results match your filters"
 *   action={<Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button>}
 * />
 *
 * // Load failure
 * <EmptyState
 *   variant="error"
 *   title="Couldn't load job numbers"
 *   action={<Button size="sm" onClick={retry}>Try again</Button>}
 * />
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState(
    { variant = 'default', icon, title, description, action, className, ...props },
    ref
  ) {
    const classes = ['eq-empty', className].filter(Boolean).join(' ')
    const resolvedIcon = icon ?? (variant !== 'default' ? VARIANT_ICON[variant] : undefined)

    return (
      <div ref={ref} className={classes} data-variant={variant} {...props}>
        {resolvedIcon != null && (
          <div className="eq-empty__icon" aria-hidden="true">
            {resolvedIcon}
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
