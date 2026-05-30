import React from 'react'
import './Skeleton.css'

export type SkeletonShape = 'text' | 'line' | 'circle' | 'card'

export interface SkeletonProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Pre-built shape for the skeleton block.
   *
   * - `text`   — one line of text height (default)
   * - `line`   — thinner pill (captions, sub-labels)
   * - `circle` — avatar / icon; size the element via `style` or `className`
   * - `card`   — full-height card placeholder
   */
  shape?: SkeletonShape
  /**
   * Render `count` skeleton blocks in sequence.
   * Each block receives the same shape + style.
   * Defaults to `1`.
   */
  count?: number
  /** Inline width override — accepts CSS length string (e.g. `'3rem'`) or pixel number. */
  width?: string | number
  /** Inline height override — accepts CSS length string or pixel number. */
  height?: string | number
}

/**
 * EQ canonical skeleton placeholder.
 *
 * Use as a content stand-in while data is loading. Renders an animated grey
 * block sized to match the shape of the real content. Animation is driven by
 * the `--eq-duration-default` CSS token — no Tailwind or raw animation values.
 *
 * All styling references `--eq-*` custom properties from `@eq-solutions/tokens`.
 *
 * @example
 * // Single text line
 * <Skeleton shape="text" width="60%" />
 *
 * // Three lines
 * <Skeleton shape="text" count={3} />
 *
 * // Avatar circle
 * <Skeleton shape="circle" width={40} height={40} />
 *
 * // Card placeholder
 * <Skeleton shape="card" />
 *
 * // Table loading state (inside <tbody>)
 * <SkeletonRows count={8} columns={5} />
 *
 * // Dashboard card grid
 * <SkeletonCards count={4} />
 */
export function Skeleton({
  shape = 'text',
  count = 1,
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) {
  const inlineStyle: React.CSSProperties = { ...style }
  if (width !== undefined) {
    inlineStyle.width = typeof width === 'number' ? `${width}px` : width
  }
  if (height !== undefined) {
    inlineStyle.height = typeof height === 'number' ? `${height}px` : height
  }

  const classes = [
    'eq-skeleton',
    `eq-skeleton--${shape}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={classes}
          style={inlineStyle}
          aria-hidden="true"
          {...props}
        />
      ))}
    </>
  )
}

Skeleton.displayName = 'Skeleton'

// ── SkeletonRows ─────────────────────────────────────────────────────────────

export interface SkeletonRowsProps {
  /** Number of skeleton rows to render. Defaults to `5`. */
  count?: number
  /**
   * Number of cell columns per row. Defaults to `4`.
   * The first column is widest (3/4), second is medium (1/2),
   * third is 2/3, remaining columns are narrow (1/3).
   */
  columns?: number
}

/**
 * Renders `count` rows of skeleton placeholders sized to fit a `<Table>` row.
 * Render inside `<tbody>` while row data is loading.
 *
 * @example
 * <tbody>
 *   {isLoading ? <SkeletonRows count={8} columns={5} /> : rows.map(…)}
 * </tbody>
 */
export function SkeletonRows({ count = 5, columns = 4 }: SkeletonRowsProps) {
  const colWidths = (colIdx: number): string => {
    if (colIdx === 0) return '75%'
    if (colIdx === 1) return '50%'
    if (colIdx === 2) return '66%'
    return '33%'
  }

  return (
    <>
      {Array.from({ length: count }).map((_, rowIdx) => (
        <tr key={rowIdx} className="eq-skeleton-rows__row">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <td key={colIdx}>
              <Skeleton shape="text" width={colWidths(colIdx)} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

SkeletonRows.displayName = 'SkeletonRows'

// ── SkeletonCards ─────────────────────────────────────────────────────────────

export interface SkeletonCardsProps {
  /** Number of card skeletons to render. Defaults to `4`. */
  count?: number
}

/**
 * A responsive grid of card-shaped skeleton placeholders.
 * Use for KPI dashboards, tile grids, or any layout that renders a grid of
 * cards while data loads.
 *
 * @example
 * {isLoading ? <SkeletonCards count={6} /> : cards.map(…)}
 */
export function SkeletonCards({ count = 4 }: SkeletonCardsProps) {
  return (
    <div className="eq-skeleton-cards">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="eq-skeleton-cards__card">
          <Skeleton shape="text" width="50%" />
          <Skeleton shape="text" width="75%" height="2rem" />
          <Skeleton shape="text" width="33%" />
        </div>
      ))}
    </div>
  )
}

SkeletonCards.displayName = 'SkeletonCards'
