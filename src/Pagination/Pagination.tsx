import React from 'react'
import './Pagination.css'

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  /** Current page, 1-indexed. */
  page: number
  /** Total number of pages. */
  pageCount: number
  /** Called with the next page number when the user picks one. */
  onPageChange: (page: number) => void
  /** Pages shown on either side of the current page. Defaults to 1. */
  siblingCount?: number
  /** Control size and gap. Defaults to `'comfortable'`. */
  density?: 'comfortable' | 'compact'
}

const ELLIPSIS = '…'

function buildRange(
  page: number,
  pageCount: number,
  siblingCount: number
): (number | typeof ELLIPSIS)[] {
  const totalSlots = siblingCount * 2 + 5 // first, last, current, 2 ellipses
  if (pageCount <= totalSlots) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }

  const left = Math.max(page - siblingCount, 2)
  const right = Math.min(page + siblingCount, pageCount - 1)

  const range: (number | typeof ELLIPSIS)[] = [1]
  if (left > 2) range.push(ELLIPSIS)
  for (let i = left; i <= right; i++) range.push(i)
  if (right < pageCount - 1) range.push(ELLIPSIS)
  range.push(pageCount)
  return range
}

/**
 * EQ canonical pagination — active page fills Sky Blue.
 *
 * All styling references `--eq-*` custom properties from `@eq-solutions/tokens`.
 *
 * @example
 * <Pagination page={page} pageCount={12} onPageChange={setPage} />
 *
 * // compact — dense Field surfaces
 * <Pagination page={page} pageCount={12} onPageChange={setPage} density="compact" />
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  density = 'comfortable',
  className,
  ...props
}: PaginationProps) {
  if (pageCount <= 1) return null
  const range = buildRange(page, pageCount, siblingCount)
  const classes = ['eq-pagination', className].filter(Boolean).join(' ')

  return (
    <nav className={classes} aria-label="Pagination" data-density={density} {...props}>
      <button
        type="button"
        className="eq-pagination__nav"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        ‹
      </button>
      {range.map((item, i) =>
        item === ELLIPSIS ? (
          <span key={`ellipsis-${i}`} className="eq-pagination__ellipsis" aria-hidden="true">
            {ELLIPSIS}
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={`eq-pagination__page${item === page ? ' eq-pagination__page--active' : ''}`}
            onClick={() => onPageChange(item)}
            aria-current={item === page ? 'page' : undefined}
            aria-label={`Page ${item}`}
          >
            {item}
          </button>
        )
      )}
      <button
        type="button"
        className="eq-pagination__nav"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  )
}

Pagination.displayName = 'Pagination'
