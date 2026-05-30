import React, { useState, useMemo } from 'react'
import './Table.css'

// ── Column definition ──────────────────────────────────────────────────────

export interface TableColumn<T> {
  /** Unique key — used for sort state and filter state tracking. */
  key: string
  /** Column header label. */
  header: string
  /**
   * Render function for cell content.
   * When omitted, falls back to `String(row[key] ?? '')`.
   */
  render?: (row: T) => React.ReactNode
  /**
   * Sort accessor — return the value to compare.
   * Omit or set `sortable: false` to disable sorting on this column.
   * Null/undefined values always sort last.
   */
  sortAccessor?: (row: T) => string | number | null | undefined
  /**
   * Set to `false` to disable sorting even when `sortAccessor` is provided.
   * When `sortAccessor` is absent this defaults to `false`.
   */
  sortable?: false
  /**
   * Enable a filter control under the column header.
   * - `'text'`   — free-text input (substring match, case-insensitive)
   * - `'select'` — dropdown; options auto-detected from row data unless
   *                `filterOptions` is provided
   */
  filterable?: 'text' | 'select'
  /** Explicit select-filter options. Only used when `filterable === 'select'`. */
  filterOptions?: { value: string; label: string }[]
  /** Optional CSS class applied to every `<td>` in this column. */
  className?: string
  /** Optional fixed column width (passed to `<th>` / `<td>`). */
  width?: string | number
  /** Text alignment for cells in this column. Defaults to `'left'`. */
  align?: 'left' | 'right' | 'center'
}

// ── Table props ────────────────────────────────────────────────────────────

export interface TableProps<T> {
  /** Column definitions. */
  columns: TableColumn<T>[]
  /** Row data. */
  rows: T[]
  /**
   * Extract a stable unique string ID from each row.
   * Defaults to `(row) => (row as Record<string, unknown>).id as string`.
   * Required when using `selectable`.
   */
  getRowId?: (row: T) => string
  /** Default column key + direction to sort by on first render. */
  defaultSort?: { key: string; dir?: 'asc' | 'desc' }
  /** Message shown when `rows` is empty (or all rows are filtered out). */
  emptyMessage?: string
  /** Additional CSS class on the outer wrapper `<div>`. */
  className?: string
  /**
   * Optional per-row inline style — use for conditional row colours.
   * Applied on top of selection / hover styles.
   */
  rowStyle?: (row: T) => React.CSSProperties | undefined
  /** When `true`, adds a leading checkbox column for row selection. */
  selectable?: boolean
  /** Controlled selected row IDs. Must be paired with `onSelectionChange`. */
  selectedIds?: Set<string>
  /** Fired when the selection set changes. */
  onSelectionChange?: (ids: Set<string>) => void
  /** Fired when a data row is clicked. */
  onRowClick?: (row: T) => void
}

// ── Component ──────────────────────────────────────────────────────────────

/**
 * EQ canonical data table.
 *
 * Generic over the row type `T`. Supports:
 * - Sortable columns (click header to sort asc → desc → unsorted)
 * - Filterable columns (text substring or select dropdown, per column)
 * - Row selection checkboxes (controlled via `selectedIds` + `onSelectionChange`)
 * - Row click handler (`onRowClick`)
 * - Per-row style overrides (`rowStyle`)
 * - Empty state with contextual message
 *
 * All styling references `--eq-*` CSS custom properties from
 * `@eq-solutions/tokens`. No hardcoded hex values.
 *
 * @example
 * // Basic sortable table
 * const columns: TableColumn<Order>[] = [
 *   { key: 'ref',    header: 'Ref',    sortAccessor: r => r.ref },
 *   { key: 'status', header: 'Status', render: r => <StatusBadge … /> },
 *   { key: 'date',   header: 'Date',   sortAccessor: r => r.date },
 * ]
 * <Table rows={orders} columns={columns} getRowId={r => r.id} />
 *
 * // Filterable + selectable
 * <Table
 *   rows={orders}
 *   columns={columns}
 *   getRowId={r => r.id}
 *   selectable
 *   selectedIds={selected}
 *   onSelectionChange={setSelected}
 *   onRowClick={r => router.push(`/orders/${r.id}`)}
 * />
 */
export function Table<T>({
  columns,
  rows,
  getRowId = (row) => (row as Record<string, unknown>).id as string,
  defaultSort,
  emptyMessage = 'No data to display.',
  className,
  rowStyle,
  selectable = false,
  selectedIds,
  onSelectionChange,
  onRowClick,
}: TableProps<T>) {
  // ── Sort state ─────────────────────────────────────────────────────
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(
    defaultSort ? { key: defaultSort.key, dir: defaultSort.dir ?? 'desc' } : null
  )

  function toggleSort(key: string) {
    setSort(prev => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
  }

  // ── Filter state ───────────────────────────────────────────────────
  const hasFilters = columns.some(col => col.filterable)
  const [filters, setFilters] = useState<Record<string, string>>({})

  function setFilter(key: string, value: string) {
    setFilters(prev => {
      const next = { ...prev }
      if (value === '') {
        delete next[key]
      } else {
        next[key] = value
      }
      return next
    })
  }

  // Auto-detect select options from row data for columns that don't provide them
  const autoSelectOptions = useMemo(() => {
    const opts: Record<string, { value: string; label: string }[]> = {}
    for (const col of columns) {
      if (col.filterable === 'select' && !col.filterOptions) {
        const seen = new Set<string>()
        for (const row of rows) {
          const val = String((row as Record<string, unknown>)[col.key] ?? '').trim()
          if (val) seen.add(val)
        }
        opts[col.key] = Array.from(seen)
          .sort()
          .map(v => ({ value: v, label: v }))
      }
    }
    return opts
  }, [columns, rows])

  // ── Filtered rows ──────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    if (Object.keys(filters).length === 0) return rows
    return rows.filter(row => {
      for (const [key, filterVal] of Object.entries(filters)) {
        const col = columns.find(c => c.key === key)
        if (!col) continue
        const cellVal = String((row as Record<string, unknown>)[key] ?? '').toLowerCase()
        if (col.filterable === 'select') {
          if (cellVal !== filterVal.toLowerCase()) return false
        } else {
          if (!cellVal.includes(filterVal.toLowerCase())) return false
        }
      }
      return true
    })
  }, [rows, filters, columns])

  // ── Sorted rows ────────────────────────────────────────────────────
  const sortedRows = useMemo(() => {
    if (!sort) return filteredRows
    const col = columns.find(c => c.key === sort.key)
    if (!col) return filteredRows
    const canSort = col.sortable !== false
    if (!canSort) return filteredRows

    const accessor: (row: T) => string | number | null | undefined =
      col.sortAccessor ?? ((row: T) => (row as Record<string, unknown>)[sort.key] as string | number | null | undefined)

    const dir = sort.dir === 'asc' ? 1 : -1
    return [...filteredRows].sort((a, b) => {
      const av = accessor(a)
      const bv = accessor(b)
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      const as = String(av).toLowerCase()
      const bs = String(bv).toLowerCase()
      return as < bs ? -1 * dir : as > bs ? 1 * dir : 0
    })
  }, [filteredRows, sort, columns])

  // ── Selection helpers ──────────────────────────────────────────────
  const allIds = sortedRows.map(getRowId)
  const allSelected =
    sortedRows.length > 0 && !!selectedIds && allIds.every(id => selectedIds.has(id))
  const someSelected = !!selectedIds && allIds.some(id => selectedIds.has(id))

  function toggleAll() {
    if (!onSelectionChange) return
    onSelectionChange(allSelected ? new Set() : new Set(allIds))
  }

  function toggleRow(id: string) {
    if (!onSelectionChange || !selectedIds) return
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange(next)
  }

  const activeFilterCount = Object.keys(filters).length
  const wrapClass = ['eq-table-wrap', className].filter(Boolean).join(' ')

  return (
    <div className={wrapClass}>
      <table className="eq-table">
        <thead>
          {/* Header row */}
          <tr>
            {selectable && (
              <th className="eq-table__checkbox-cell" scope="col">
                <input
                  type="checkbox"
                  className="eq-table__checkbox"
                  checked={allSelected}
                  ref={el => {
                    if (el) el.indeterminate = someSelected && !allSelected
                  }}
                  onChange={toggleAll}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map(col => {
              const isSortable = col.sortable !== false
              const isSorted = sort?.key === col.key
              const sortIcon = isSorted ? (sort!.dir === 'asc' ? '▲' : '▼') : '↕'
              return (
                <th
                  key={col.key}
                  scope="col"
                  data-sortable={isSortable || undefined}
                  onClick={isSortable ? () => toggleSort(col.key) : undefined}
                  style={{
                    textAlign: col.align ?? 'left',
                    width: col.width,
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    {col.header}
                    {isSortable && (
                      <span
                        className={`eq-table__sort-icon${isSorted ? ' eq-table__sort-icon--active' : ''}`}
                        aria-hidden="true"
                      >
                        {sortIcon}
                      </span>
                    )}
                  </span>
                </th>
              )
            })}
          </tr>

          {/* Filter row */}
          {hasFilters && (
            <tr className="eq-table__filter-row">
              {selectable && <th className="eq-table__checkbox-cell" />}
              {columns.map(col => (
                <th key={`filter-${col.key}`} style={{ width: col.width }}>
                  {col.filterable === 'text' && (
                    <input
                      type="text"
                      value={filters[col.key] ?? ''}
                      onChange={e => setFilter(col.key, e.target.value)}
                      placeholder="Filter…"
                      className="eq-table__filter-input"
                      aria-label={`Filter by ${col.header}`}
                    />
                  )}
                  {col.filterable === 'select' && (
                    <select
                      value={filters[col.key] ?? ''}
                      onChange={e => setFilter(col.key, e.target.value)}
                      className="eq-table__filter-select"
                      aria-label={`Filter by ${col.header}`}
                    >
                      <option value="">All</option>
                      {(col.filterOptions ?? autoSelectOptions[col.key] ?? []).map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                </th>
              ))}
            </tr>
          )}
        </thead>

        <tbody>
          {sortedRows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="eq-table__empty"
              >
                {activeFilterCount > 0 ? 'No results match your filters.' : emptyMessage}
              </td>
            </tr>
          ) : (
            sortedRows.map((row, i) => {
              const rowId = getRowId(row)
              const isSelected = selectable && !!selectedIds?.has(rowId)
              return (
                <tr
                  key={rowId || i}
                  data-selected={isSelected || undefined}
                  data-clickable={onRowClick ? true : undefined}
                  style={rowStyle?.(row)}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td
                      className="eq-table__checkbox-cell"
                      onClick={e => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="eq-table__checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(rowId)}
                        aria-label="Select row"
                      />
                    </td>
                  )}
                  {columns.map(col => {
                    const tdClass = ['eq-table__td', col.className]
                      .filter(Boolean)
                      .join(' ') || undefined
                    return (
                      <td
                        key={col.key}
                        className={tdClass}
                        style={{
                          textAlign: col.align ?? 'left',
                          width: col.width,
                        }}
                      >
                        {col.render
                          ? col.render(row)
                          : String((row as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    )
                  })}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

Table.displayName = 'Table'

// Re-export column type as TableColumnDef for consumers who prefer it
export type { TableColumn as TableColumnDef }
