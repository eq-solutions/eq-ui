import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import {
  Search, Download, Columns, Check, ChevronRight, ChevronUp, ChevronDown,
  ChevronsUpDown, X, ChevronLeft, Archive, Trash2, Filter,
} from 'lucide-react'
import { Skeleton } from '../Skeleton/Skeleton'
import { ConfirmDialog } from '../Modal/ConfirmDialog'
import './Table.css'

// ── Column definition ──────────────────────────────────────────────────────

export interface TableColumn<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  sortAccessor?: (row: T) => string | number | null | undefined
  sortable?: false
  /**
   * `'multiselect'` renders an Excel-style filter icon in the column header —
   * a popover with a search box, Select All / Reset, and a checkbox list of
   * unique values — instead of the single-value `<select>` in the filter row.
   */
  filterable?: 'text' | 'select' | 'multiselect'
  filterOptions?: { value: string; label: string }[]
  className?: string
  width?: string | number
  align?: 'left' | 'right' | 'center'
  /** Prevent this column from being hidden via the column-toggle popover. */
  locked?: boolean
  /**
   * Override what global search and the `'text'` per-column filter match
   * against, for composite columns whose display doesn't come from a single
   * `row[key]` (e.g. a merged "Contact" column built from phone + email).
   * Falls back to `row[key]` when omitted.
   */
  filterValue?: (row: T) => string | null | undefined
  /**
   * Override the value written to the CSV export for this column. Falls
   * back to `row[key]` when omitted — set this for composite columns
   * (see `filterValue`) so export isn't left blank.
   */
  exportValue?: (row: T) => string
}

// ── Slicer definition ──────────────────────────────────────────────────────

export interface TableSlicer<T> {
  key: string
  label: string
  /** Undefined = "All" — no filter applied. */
  filter?: (row: T) => boolean
  /** CSS colour value for the status dot (e.g. `var(--eq-error-text)`). */
  dot?: string
}

// ── Pagination ─────────────────────────────────────────────────────────────

export interface TablePagination {
  /** Rows per page. Defaults to 50. */
  pageSize?: number
  /** Override the total count shown in the footer (for server-side pagination). */
  totalCount?: number
}

// ── Table props ────────────────────────────────────────────────────────────

export interface TableProps<T> {
  columns: TableColumn<T>[]
  rows: T[]
  getRowId?: (row: T) => string
  defaultSort?: { key: string; dir?: 'asc' | 'desc' }
  emptyMessage?: string
  className?: string
  rowStyle?: (row: T) => React.CSSProperties | undefined
  selectable?: boolean
  selectedIds?: Set<string>
  onSelectionChange?: (ids: Set<string>) => void
  onRowClick?: (row: T) => void
  loading?: boolean
  loadingRows?: number

  // ── v1.4 additions ────────────────────────────────────────────────────

  /** Quick-filter chip row above the table. */
  slicers?: TableSlicer<T>[]
  /** Controlled active slicer key. Defaults to the first slicer's key. */
  activeSlicer?: string
  onSlicerChange?: (key: string) => void
  /**
   * Let multiple slicer chips be active at once (AND — a row must match
   * every selected chip's filter), toggled on/off by click instead of the
   * default single-select radio behaviour. The `'all'`-style chip (one with
   * no `filter`) acts as "clear selection" rather than a real filter.
   * Default false — existing single-select consumers (controlled via
   * `activeSlicer`/`onSlicerChange`) are unaffected. Uncontrolled only;
   * `activeSlicer`/`onSlicerChange` are ignored when this is true.
   */
  multiSlicer?: boolean

  /** Show a global search input in the toolbar. Pass `true` for defaults or an object to set placeholder. */
  globalSearch?: boolean | { placeholder?: string }

  /** Show a Columns toggle button that opens a popover to show/hide columns. */
  columnToggle?: boolean

  /** Column keys hidden the first time a user sees this table (before any localStorage entry exists). */
  defaultHiddenColumns?: string[]

  /**
   * Persist column visibility to localStorage under this key, so a user's
   * show/hide choices survive reloads. Scope the key per table + tenant
   * (e.g. `staff-columns:${tenantSlug}`) so preferences don't leak across tenants.
   */
  persistKey?: string

  /** Show an Export button that downloads the current filtered+sorted rows as CSV. */
  exportable?: boolean | { filename?: string }

  /**
   * Render function for the ink bulk-action bar (appears when rows are selected).
   * Use `<TableBulkAction>` for styled buttons inside the bar.
   */
  bulkActions?: (selectedRows: T[], clearSelection: () => void) => React.ReactNode

  /**
   * Per-row indicator dot shown at the leading edge of the first data column.
   * Return `{ color: string }` to show a coloured dot (e.g. overdue items).
   * Return `null` / `undefined` for no dot on that row.
   */
  rowIndicator?: (row: T) => { color: string } | null | undefined

  /** Row height. Defaults to `'comfortable'`. */
  density?: 'comfortable' | 'compact'

  /** Row separator style. Defaults to `'lines'`. */
  rowVariant?: 'lines' | 'zebra' | 'plain'

  /** Paginate the rows. Client-side: slices sorted rows. */
  pagination?: TablePagination

  /**
   * Summary text shown in the footer.
   * Pass a string or a render function receiving (visibleCount, totalCount).
   */
  summary?: string | ((visibleCount: number, totalCount: number) => React.ReactNode)

  // ── Built-in row actions ──────────────────────────────────────────────

  /** Called with the selected rows after the user confirms deletion. Enables row selection automatically. */
  onDelete?: (rows: T[]) => Promise<void> | void
  /** Called with the selected rows when the user clicks Archive. Enables row selection automatically. */
  onArchive?: (rows: T[]) => Promise<void> | void
  /** Label for the delete button. Defaults to `'Delete'`. */
  deleteLabel?: string
  /** Label for the archive button. Defaults to `'Archive'`. */
  archiveLabel?: string
  /**
   * Customise the delete confirmation dialog copy.
   * `title` and `description` each accept a string or a function receiving the selected count.
   *
   * @example
   * deleteConfirm={{ description: n => `${n} plant item${n === 1 ? '' : 's'} will be permanently removed.` }}
   */
  deleteConfirm?: {
    title?: string | ((count: number) => string)
    description?: string | ((count: number) => string)
  }
  /**
   * Show a confirmation dialog before archiving.
   * Pass `true` for default copy, or an object to customise title/description.
   * Omit (default) for immediate archive with no confirm.
   */
  archiveConfirm?: boolean | {
    title?: string | ((count: number) => string)
    description?: string | ((count: number) => string)
  }
  /**
   * Called when a delete or archive action throws. Use to show a toast or error banner.
   * The dialog/loading state is already reset before this fires.
   */
  onActionError?: (action: 'delete' | 'archive', error: unknown) => void
}

// ── TableBulkAction — styled button for use inside bulkActions ─────────────

export interface TableBulkActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  danger?: boolean
}

export function TableBulkAction({ icon, danger, children, className, ...rest }: TableBulkActionProps) {
  return (
    <button
      className={['eq-table__bulk-act', danger ? 'eq-table__bulk-act--danger' : '', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {icon && <span className="eq-table__bulk-act-icon">{icon}</span>}
      {children}
    </button>
  )
}

TableBulkAction.displayName = 'TableBulkAction'

// ── Helpers ────────────────────────────────────────────────────────────────

function exportToCsv<T>(
  rows: T[],
  columns: TableColumn<T>[],
  filename: string,
) {
  const headers = columns.map(c => `"${c.header.replace(/"/g, '""')}"`)
  const body = rows.map(row =>
    columns.map(col => {
      const raw = col.exportValue ? col.exportValue(row) : (row as Record<string, unknown>)[col.key]
      const val = raw == null ? '' : String(raw)
      return `"${val.replace(/"/g, '""')}"`
    }).join(',')
  )
  const csv = [headers.join(','), ...body].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function buildPageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = [1]
  if (current > 3) pages.push('…')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
}

// ── Component ──────────────────────────────────────────────────────────────

/**
 * EQ canonical data table — v1.4.
 *
 * Covers zones C–G from the EQ table design spec:
 * toolbar (slicers + search + column toggle + export), column headers,
 * data rows, ink bulk-action bar, and footer with pagination.
 *
 * Zone A (page header) and Zone B (saved-view tabs) live at the page level
 * in each consuming app.
 *
 * @example
 * <Table
 *   rows={items}
 *   columns={columns}
 *   getRowId={r => r.id}
 *   slicers={[
 *     { key: 'all', label: 'All' },
 *     { key: 'overdue', label: 'Overdue', filter: r => r.status === 'overdue', dot: 'var(--eq-error-text)' },
 *   ]}
 *   globalSearch
 *   columnToggle
 *   exportable
 *   selectable
 *   selectedIds={selected}
 *   onSelectionChange={setSelected}
 *   bulkActions={(rows, clear) => (
 *     <>
 *       <TableBulkAction icon={<Archive size={15} />} onClick={() => archive(rows)}>Archive</TableBulkAction>
 *       <TableBulkAction icon={<Trash2 size={15} />} danger onClick={() => { delete(rows); clear() }}>Delete</TableBulkAction>
 *     </>
 *   )}
 *   pagination={{ pageSize: 25 }}
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
  loading = false,
  loadingRows = 5,
  // v1.4
  slicers,
  activeSlicer: controlledSlicer,
  onSlicerChange,
  multiSlicer = false,
  globalSearch = false,
  columnToggle = false,
  defaultHiddenColumns,
  persistKey,
  exportable = false,
  bulkActions,
  rowIndicator,
  density = 'comfortable',
  rowVariant = 'lines',
  pagination,
  summary,
  onDelete,
  onArchive,
  deleteLabel = 'Delete',
  archiveLabel = 'Archive',
  deleteConfirm,
  archiveConfirm,
  onActionError,
}: TableProps<T>) {

  // ── Sort ───────────────────────────────────────────────────────────────
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

  // ── Per-column filters ─────────────────────────────────────────────────
  const hasColumnFilters = columns.some(c => c.filterable === 'text' || c.filterable === 'select')
  const [filters, setFilters] = useState<Record<string, string>>({})
  function setFilter(key: string, value: string) {
    setFilters(prev => {
      const next = { ...prev }
      if (value === '') delete next[key]
      else next[key] = value
      return next
    })
  }
  // ── Multi-select (Excel-style) header filters ──────────────────────────
  const [multiFilters, setMultiFilters] = useState<Record<string, Set<string>>>({})
  function toggleMultiFilterValue(key: string, value: string) {
    setMultiFilters(prev => {
      const next = { ...prev }
      const set = new Set(next[key] ?? [])
      if (set.has(value)) set.delete(value)
      else set.add(value)
      if (set.size === 0) delete next[key]
      else next[key] = set
      return next
    })
  }
  function setMultiFilterAll(key: string, values: string[], checked: boolean) {
    setMultiFilters(prev => {
      const next = { ...prev }
      if (checked) next[key] = new Set(values)
      else delete next[key]
      return next
    })
  }
  function clearMultiFilter(key: string) {
    setMultiFilters(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const [openFilterMenu, setOpenFilterMenu] = useState<string | null>(null)
  const [filterMenuSearch, setFilterMenuSearch] = useState('')
  const filterMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!openFilterMenu) return
    function onOutside(e: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setOpenFilterMenu(null)
        setFilterMenuSearch('')
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [openFilterMenu])

  // ── Slicer ─────────────────────────────────────────────────────────────
  const defaultSlicerKey = slicers?.[0]?.key ?? 'all'
  const [internalSlicer, setInternalSlicer] = useState(defaultSlicerKey)
  const activeSlicer = controlledSlicer ?? internalSlicer

  function handleSlicerChange(key: string) {
    setInternalSlicer(key)
    onSlicerChange?.(key)
  }

  // multiSlicer is always uncontrolled — toggled chips are per-view UI
  // state, not something a parent needs to drive (unlike activeSlicer,
  // which existing single-select consumers control for e.g. a URL param).
  const [activeSlicerSet, setActiveSlicerSet] = useState<Set<string>>(new Set())

  function handleSlicerToggle(s: TableSlicer<T>) {
    if (!s.filter) {
      // The 'all'-style chip (no filter fn) means "clear selection".
      setActiveSlicerSet(new Set())
      return
    }
    setActiveSlicerSet(prev => {
      const next = new Set(prev)
      if (next.has(s.key)) next.delete(s.key)
      else next.add(s.key)
      return next
    })
  }

  const slicerCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    if (slicers) {
      for (const s of slicers) {
        counts[s.key] = s.filter ? rows.filter(s.filter).length : rows.length
      }
    }
    return counts
  }, [slicers, rows])

  // ── Global search ──────────────────────────────────────────────────────
  const [query, setQuery] = useState('')
  const searchPlaceholder =
    globalSearch === true || globalSearch === false
      ? 'Search…'
      : (globalSearch.placeholder ?? 'Search…')

  // ── Column visibility ──────────────────────────────────────────────────
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(() => {
    if (persistKey) {
      try {
        const stored = window.localStorage.getItem(`eq-table-hidden-cols:${persistKey}`)
        if (stored) return new Set(JSON.parse(stored) as string[])
      } catch {
        // localStorage unavailable (SSR, private mode, quota) — fall through to default
      }
    }
    return new Set(defaultHiddenColumns ?? [])
  })
  const [colsMenuOpen, setColsMenuOpen] = useState(false)
  const colsMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!colsMenuOpen) return
    function onOutside(e: MouseEvent) {
      if (colsMenuRef.current && !colsMenuRef.current.contains(e.target as Node)) {
        setColsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [colsMenuOpen])

  function toggleCol(key: string) {
    setHiddenCols(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      if (persistKey) {
        try {
          window.localStorage.setItem(`eq-table-hidden-cols:${persistKey}`, JSON.stringify([...next]))
        } catch {
          // localStorage unavailable — visibility still works for this session
        }
      }
      return next
    })
  }

  // ── Column order ─────────────────────────────────────────────────────
  const [colOrder, setColOrder] = useState<string[]>(() => {
    const defaultOrder = columns.map(c => c.key)
    if (persistKey) {
      try {
        const stored = window.localStorage.getItem(`eq-table-col-order:${persistKey}`)
        if (stored) {
          const storedOrder = JSON.parse(stored) as string[]
          const known = new Set(defaultOrder)
          const kept = storedOrder.filter(k => known.has(k))
          const missing = defaultOrder.filter(k => !kept.includes(k))
          return [...kept, ...missing]
        }
      } catch {
        // localStorage unavailable — fall through to default
      }
    }
    return defaultOrder
  })

  // Columns not yet seen in colOrder (added to the `columns` prop after the
  // user's stored order was captured) are appended at the end, in prop order.
  const orderedColumns = useMemo(() => {
    const remaining = new Map(columns.map(c => [c.key, c]))
    const ordered: TableColumn<T>[] = []
    for (const key of colOrder) {
      const col = remaining.get(key)
      if (col) { ordered.push(col); remaining.delete(key) }
    }
    for (const col of columns) {
      if (remaining.has(col.key)) ordered.push(col)
    }
    return ordered
  }, [columns, colOrder])

  function moveColumn(key: string, direction: -1 | 1) {
    const keys = orderedColumns.map(c => c.key)
    const idx = keys.indexOf(key)
    const swapIdx = idx + direction
    if (idx === -1 || swapIdx < 0 || swapIdx >= keys.length) return
    const next = [...keys]
    ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
    if (persistKey) {
      try {
        window.localStorage.setItem(`eq-table-col-order:${persistKey}`, JSON.stringify(next))
      } catch {
        // localStorage unavailable — order still updates for this session
      }
    }
    setColOrder(next)
  }

  const visibleCols = useMemo(
    () => orderedColumns.filter(c => !hiddenCols.has(c.key)),
    [orderedColumns, hiddenCols]
  )

  // ── Filter pipeline: slicer → search → per-column → sort ──────────────
  // Shared by filteredRows and the multiselect option lists below — a
  // multiselect column's own checklist cascades off every OTHER active
  // filter (slicer, search, text/select columns, other multiselect
  // columns), matching Excel: filtering one column narrows what's offered
  // in the next column's dropdown. `excludeMultiKey` lets a column's own
  // options be computed as if its own filter weren't applied yet.
  const rowMatchesFilters = useCallback((row: T, excludeMultiKey?: string) => {
    if (slicers && multiSlicer) {
      for (const key of activeSlicerSet) {
        const s = slicers.find(s => s.key === key)
        if (s?.filter && !s.filter(row)) return false
      }
    } else if (slicers && activeSlicer) {
      const s = slicers.find(s => s.key === activeSlicer)
      if (s?.filter && !s.filter(row)) return false
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      const matches = columns.some(col => {
        const val = col.filterValue ? col.filterValue(row) : (row as Record<string, unknown>)[col.key]
        return val != null && String(val).toLowerCase().includes(q)
      })
      if (!matches) return false
    }

    for (const [key, filterVal] of Object.entries(filters)) {
      const col = columns.find(c => c.key === key)
      if (!col) continue
      const rawVal = col.filterValue ? col.filterValue(row) : (row as Record<string, unknown>)[key]
      const cellVal = String(rawVal ?? '').toLowerCase()
      if (col.filterable === 'select') {
        if (cellVal !== filterVal.toLowerCase()) return false
      } else {
        if (!cellVal.includes(filterVal.toLowerCase())) return false
      }
    }

    for (const [key, valueSet] of Object.entries(multiFilters)) {
      if (key === excludeMultiKey) continue
      if (!valueSet || valueSet.size === 0) continue
      const multiCol = columns.find(c => c.key === key)
      const raw = multiCol?.filterValue ? multiCol.filterValue(row) : (row as Record<string, unknown>)[key]
      const cellVal = String(raw ?? '').toLowerCase()
      const matches = Array.from(valueSet).some(v => v.toLowerCase() === cellVal)
      if (!matches) return false
    }

    return true
  }, [slicers, activeSlicer, multiSlicer, activeSlicerSet, query, filters, multiFilters, columns])

  const autoSelectOptions = useMemo(() => {
    const opts: Record<string, { value: string; label: string }[]> = {}
    for (const col of columns) {
      if ((col.filterable === 'select' || col.filterable === 'multiselect') && !col.filterOptions) {
        const seen = new Set<string>()
        for (const row of rows) {
          if (col.filterable === 'multiselect' && !rowMatchesFilters(row, col.key)) continue
          const raw = col.filterValue ? col.filterValue(row) : (row as Record<string, unknown>)[col.key]
          const val = String(raw ?? '').trim()
          if (val) seen.add(val)
        }
        opts[col.key] = Array.from(seen).sort().map(v => ({ value: v, label: v }))
      }
    }
    return opts
  }, [columns, rows, rowMatchesFilters])

  const filteredRows = useMemo(
    () => rows.filter(row => rowMatchesFilters(row)),
    [rows, rowMatchesFilters]
  )

  const sortedRows = useMemo(() => {
    if (!sort) return filteredRows
    const col = columns.find(c => c.key === sort.key)
    if (!col || col.sortable === false) return filteredRows
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
      return String(av).toLowerCase() < String(bv).toLowerCase() ? -dir : String(av).toLowerCase() > String(bv).toLowerCase() ? dir : 0
    })
  }, [filteredRows, sort, columns])

  // ── Pagination ─────────────────────────────────────────────────────────
  const pageSize = pagination?.pageSize ?? 50
  const [page, setPage] = useState(1)
  const totalCount = pagination?.totalCount ?? sortedRows.length
  const totalPages = pagination ? Math.max(1, Math.ceil(sortedRows.length / pageSize)) : 1

  useEffect(() => { setPage(1) }, [query, activeSlicer, activeSlicerSet, filters, multiFilters])

  const pagedRows = useMemo(() => {
    if (!pagination) return sortedRows
    const start = (page - 1) * pageSize
    return sortedRows.slice(start, start + pageSize)
  }, [sortedRows, pagination, page, pageSize])

  // ── Selection ──────────────────────────────────────────────────────────
  const hasBuiltInActions = !!(onDelete || onArchive)
  const effectiveSelectable = selectable || hasBuiltInActions
  const [internalSelected, setInternalSelected] = useState<Set<string>>(new Set())
  const effectiveSelectedIds = selectedIds ?? (hasBuiltInActions ? internalSelected : undefined)
  const effectiveOnSelChange = onSelectionChange ?? (hasBuiltInActions ? setInternalSelected : undefined)

  const [confirmAction, setConfirmAction] = useState<'delete' | 'archive' | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const allIds = pagedRows.map(getRowId)
  const allSelected = pagedRows.length > 0 && !!effectiveSelectedIds && allIds.every(id => effectiveSelectedIds.has(id))
  const someSelected = !!effectiveSelectedIds && allIds.some(id => effectiveSelectedIds.has(id))
  const headState = allSelected ? 'on' : someSelected ? 'mixed' : 'off'

  function toggleAll() {
    if (!effectiveOnSelChange) return
    effectiveOnSelChange(allSelected ? new Set() : new Set(allIds))
  }
  function toggleRow(id: string) {
    if (!effectiveOnSelChange || !effectiveSelectedIds) return
    const next = new Set(effectiveSelectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    effectiveOnSelChange(next)
  }

  const selectedRows = useMemo(
    () => rows.filter(r => effectiveSelectedIds?.has(getRowId(r))),
    [rows, effectiveSelectedIds, getRowId]
  )
  const clearSelection = useCallback(() => effectiveOnSelChange?.(new Set()), [effectiveOnSelChange])
  const selCount = effectiveSelectedIds?.size ?? 0

  // ── Built-in bulk actions ──────────────────────────────────────────────

  async function handleConfirmedAction() {
    if (!confirmAction) return
    setActionLoading(true)
    try {
      if (confirmAction === 'delete') await onDelete?.(selectedRows)
      else await onArchive?.(selectedRows)
      clearSelection()
      setConfirmAction(null)
    } catch (err) {
      onActionError?.(confirmAction, err)
      setConfirmAction(null)
    } finally {
      setActionLoading(false)
    }
  }

  const effectiveBulkActions = useMemo(() => {
    if (!hasBuiltInActions) return bulkActions
    return (selectedRows: T[], clear: () => void) => (
      <>
        {bulkActions?.(selectedRows, clear)}
        {onArchive && (
          <TableBulkAction
            icon={<Archive size={15} />}
            disabled={actionLoading}
            onClick={async () => {
              if (archiveConfirm) {
                setConfirmAction('archive')
              } else {
                setActionLoading(true)
                try { await onArchive(selectedRows); clear() }
                catch (err) { onActionError?.('archive', err) }
                finally { setActionLoading(false) }
              }
            }}
          >
            {archiveLabel}
          </TableBulkAction>
        )}
        {onDelete && (
          <TableBulkAction
            icon={<Trash2 size={15} />}
            danger
            disabled={actionLoading}
            onClick={() => setConfirmAction('delete')}
          >
            {deleteLabel}
          </TableBulkAction>
        )}
      </>
    )
  }, [hasBuiltInActions, bulkActions, onArchive, onDelete, archiveLabel, deleteLabel, archiveConfirm, actionLoading, onActionError])

  // ── Export ─────────────────────────────────────────────────────────────
  function handleExport() {
    const filename =
      typeof exportable === 'object' && exportable.filename
        ? exportable.filename
        : 'export.csv'
    exportToCsv(sortedRows, visibleCols, filename)
  }

  // ── Summary text ───────────────────────────────────────────────────────
  const summaryNode = useMemo(() => {
    if (!summary && !pagination) return null
    const visible = pagedRows.length
    const total = pagination ? totalCount : sortedRows.length
    if (typeof summary === 'function') return summary(visible, total)
    if (typeof summary === 'string') return summary
    if (pagination) {
      const start = (page - 1) * pageSize + 1
      const end = Math.min(page * pageSize, sortedRows.length)
      return (
        <>Showing <strong>{start}–{end}</strong> of <strong>{totalCount.toLocaleString()}</strong></>
      )
    }
    return null
  }, [summary, pagination, pagedRows.length, sortedRows.length, totalCount, page, pageSize])

  // ── Toolbar visibility ─────────────────────────────────────────────────
  const hasToolbar = !!(slicers || globalSearch || columnToggle || exportable)
  const showFooter = !!(summaryNode || (pagination && totalPages > 1))
  const activeFilterCount = Object.keys(filters).length + Object.keys(multiFilters).length + (query ? 1 : 0)

  const wrapClass = ['eq-table-wrap', className].filter(Boolean).join(' ')

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className={wrapClass}>

      {/* Zone C — Toolbar */}
      {hasToolbar && (
        <div className="eq-table-toolbar">
          {slicers && slicers.length > 0 && (
            <div className="eq-table-slicers" role="group" aria-label="Quick filters">
              {slicers.map(s => {
                const isActive = multiSlicer
                  ? (s.filter ? activeSlicerSet.has(s.key) : activeSlicerSet.size === 0)
                  : activeSlicer === s.key
                return (
                  <button
                    key={s.key}
                    className={`eq-table-slicer${isActive ? ' eq-table-slicer--active' : ''}`}
                    aria-pressed={isActive}
                    onClick={() => multiSlicer ? handleSlicerToggle(s) : handleSlicerChange(s.key)}
                  >
                    {s.dot && (
                      <span className="eq-table-slicer__dot" style={{ background: s.dot }} aria-hidden="true" />
                    )}
                    {s.label}
                    <span className="eq-table-slicer__count">
                      {slicerCounts[s.key] ?? 0}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          <div className="eq-table-toolbar__right">
            {globalSearch && (
              <div className="eq-table-search">
                <Search size={16} aria-hidden="true" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  aria-label="Search"
                />
                {query && (
                  <button
                    className="eq-table-search__clear"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}

            {columnToggle && (
              <div ref={colsMenuRef} className="eq-table-cols-wrap">
                <button
                  className={`eq-table-iconbtn${colsMenuOpen ? ' eq-table-iconbtn--open' : ''}`}
                  aria-expanded={colsMenuOpen}
                  aria-haspopup="true"
                  onClick={() => setColsMenuOpen(o => !o)}
                >
                  <Columns size={16} aria-hidden="true" />
                  Columns
                </button>
                {colsMenuOpen && (
                  <div className="eq-table-popover" role="menu">
                    <div className="eq-table-popover__header">Show columns</div>
                    {orderedColumns.map((col, colIdx) => {
                      const isVisible = !hiddenCols.has(col.key)
                      return (
                        <div
                          key={col.key}
                          className={[
                            'eq-table-poprow',
                            isVisible ? 'eq-table-poprow--on' : '',
                            col.locked ? 'eq-table-poprow--locked' : '',
                          ].filter(Boolean).join(' ')}
                          role="menuitemcheckbox"
                          aria-checked={isVisible}
                          tabIndex={col.locked ? -1 : 0}
                          onClick={() => !col.locked && toggleCol(col.key)}
                          onKeyDown={e => {
                            if ((e.key === ' ' || e.key === 'Enter') && !col.locked) {
                              e.preventDefault()
                              toggleCol(col.key)
                            }
                          }}
                        >
                          <span className="eq-table-poprow__check" aria-hidden="true">
                            <Check size={12} />
                          </span>
                          <span className="eq-table-poprow__label">{col.header}</span>
                          {col.locked && (
                            <span className="eq-table-poprow__pinned">Pinned</span>
                          )}
                          <span className="eq-table-poprow__reorder">
                            <button
                              type="button"
                              className="eq-table-poprow__reorder-btn"
                              aria-label={`Move ${col.header} up`}
                              disabled={colIdx === 0}
                              onClick={e => { e.stopPropagation(); moveColumn(col.key, -1) }}
                            >
                              <ChevronUp size={12} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="eq-table-poprow__reorder-btn"
                              aria-label={`Move ${col.header} down`}
                              disabled={colIdx === orderedColumns.length - 1}
                              onClick={e => { e.stopPropagation(); moveColumn(col.key, 1) }}
                            >
                              <ChevronDown size={12} aria-hidden="true" />
                            </button>
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {exportable && (
              <button className="eq-table-iconbtn" onClick={handleExport}>
                <Download size={16} aria-hidden="true" />
                Export
              </button>
            )}
          </div>
        </div>
      )}

      {/* Card: table + footer + bulk bar */}
      <div className="eq-table-card">
        <table
          className="eq-table"
          data-density={density}
          data-rows={rowVariant}
        >
          <thead>
            <tr>
              {effectiveSelectable && (
                <th className="eq-table__col-check" scope="col">
                  <div className="eq-table__checkcell">
                    <span
                      className={[
                        'eq-table__chk',
                        'eq-table__chk--head',
                        headState === 'on' ? 'eq-table__chk--on' : '',
                        headState === 'mixed' ? 'eq-table__chk--mixed' : '',
                      ].filter(Boolean).join(' ')}
                      role="checkbox"
                      aria-checked={headState === 'on' ? true : headState === 'mixed' ? 'mixed' : false}
                      tabIndex={0}
                      onClick={e => { e.stopPropagation(); toggleAll() }}
                      onKeyDown={e => {
                        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleAll() }
                      }}
                    >
                      {headState !== 'mixed' && <Check size={12} aria-hidden="true" />}
                    </span>
                  </div>
                </th>
              )}

              {visibleCols.map(col => {
                const isSortable = col.sortable !== false
                const isSorted = sort?.key === col.key
                const isMultiFilter = col.filterable === 'multiselect'
                const activeMultiCount = multiFilters[col.key]?.size ?? 0
                const menuOpen = openFilterMenu === col.key
                const filterOpts = col.filterOptions ?? autoSelectOptions[col.key] ?? []
                const visibleOpts = filterMenuSearch.trim() && menuOpen
                  ? filterOpts.filter(o => o.label.toLowerCase().includes(filterMenuSearch.toLowerCase()))
                  : filterOpts
                const selectedVals = multiFilters[col.key] ?? new Set<string>()
                const allVisibleChecked = visibleOpts.length > 0 && visibleOpts.every(o => selectedVals.has(o.value))
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={isSortable ? 'eq-table__th--sortable' : ''}
                    data-sorted={isSorted || undefined}
                    style={{ width: col.width, textAlign: col.align ?? 'left' }}
                    onClick={isSortable ? () => toggleSort(col.key) : undefined}
                  >
                    <span className="eq-table__th-inner">
                      {col.header}
                      {isSortable && (
                        <span className="eq-table__sort-icon" aria-hidden="true">
                          {isSorted
                            ? (sort!.dir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)
                            : <ChevronsUpDown size={13} />}
                        </span>
                      )}
                      {isMultiFilter && (
                        <span
                          className="eq-table__th-filter-wrap"
                          ref={menuOpen ? filterMenuRef : undefined}
                        >
                          <button
                            type="button"
                            className={`eq-table__th-filter-btn${activeMultiCount > 0 ? ' eq-table__th-filter-btn--active' : ''}`}
                            aria-label={`Filter by ${col.header}`}
                            aria-haspopup="true"
                            aria-expanded={menuOpen}
                            onClick={e => {
                              e.stopPropagation()
                              setFilterMenuSearch('')
                              setOpenFilterMenu(prev => prev === col.key ? null : col.key)
                            }}
                          >
                            <Filter size={12} aria-hidden="true" />
                            {activeMultiCount > 0 && (
                              <span className="eq-table__th-filter-count">{activeMultiCount}</span>
                            )}
                          </button>
                          {menuOpen && (
                            // ARIA menu containers (role="menu") aren't themselves focusable per
                            // the APG — only menuitems are, via roving tabindex. This div's only
                            // handler stops propagation to the row's onClick; it doesn't itself
                            // perform an action.
                            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
                            <div
                              className="eq-table__filter-menu"
                              role="menu"
                              onClick={e => e.stopPropagation()}
                            >
                              <div className="eq-table__filter-menu-search">
                                <Search size={13} aria-hidden="true" />
                                {/* Focus-follows-action: this input only mounts when the user
                                    explicitly clicks the Filter button, not on page load, so
                                    there's no disorienting ambient focus jump. */}
                                <input
                                  type="text"
                                  // eslint-disable-next-line jsx-a11y/no-autofocus
                                  autoFocus
                                  placeholder="Search…"
                                  value={filterMenuSearch}
                                  onChange={e => setFilterMenuSearch(e.target.value)}
                                  aria-label={`Search ${col.header} values`}
                                />
                              </div>
                              <div className="eq-table__filter-menu-actions">
                                <button
                                  type="button"
                                  onClick={() => setMultiFilterAll(col.key, visibleOpts.map(o => o.value), !allVisibleChecked)}
                                  disabled={visibleOpts.length === 0}
                                >
                                  {allVisibleChecked ? 'Deselect all' : 'Select all'}
                                </button>
                                {selectedVals.size > 0 && (
                                  <button type="button" onClick={() => clearMultiFilter(col.key)}>
                                    Reset
                                  </button>
                                )}
                              </div>
                              <div className="eq-table__filter-menu-list">
                                {visibleOpts.length === 0 ? (
                                  <div className="eq-table__filter-menu-empty">No matches</div>
                                ) : visibleOpts.map(opt => {
                                  const checked = selectedVals.has(opt.value)
                                  return (
                                    <label key={opt.value} className="eq-table__filter-menu-row">
                                      <span
                                        className={`eq-table__filter-menu-check${checked ? ' eq-table__filter-menu-check--on' : ''}`}
                                        aria-hidden="true"
                                      >
                                        {checked && <Check size={11} />}
                                      </span>
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleMultiFilterValue(col.key, opt.value)}
                                      />
                                      <span>{opt.label}</span>
                                    </label>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                )
              })}

              {/* trailing chevron column */}
              <th className="eq-table__col-chev" aria-label="" scope="col" />
            </tr>

            {/* Per-column filter row */}
            {hasColumnFilters && !loading && (
              <tr className="eq-table__filter-row">
                {effectiveSelectable && <th className="eq-table__col-check" />}
                {visibleCols.map(col => (
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
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    )}
                  </th>
                ))}
                <th />
              </tr>
            )}
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: loadingRows }).map((_, rowIdx) => (
                <tr key={`sk-${rowIdx}`} aria-hidden="true">
                  {selectable && <td className="eq-table__col-check" />}
                  {visibleCols.map((col, colIdx) => (
                    <td key={col.key} style={{ textAlign: col.align ?? 'left', width: col.width }}>
                      <Skeleton shape="text" width={colIdx === 0 ? '70%' : '50%'} />
                    </td>
                  ))}
                  <td className="eq-table__col-chev" />
                </tr>
              ))
            ) : pagedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleCols.length + (effectiveSelectable ? 1 : 0) + 1}
                  className="eq-table__empty"
                >
                  {activeFilterCount > 0 ? 'No results match your filters.' : emptyMessage}
                </td>
              </tr>
            ) : (
              pagedRows.map((row, i) => {
                const rowId = getRowId(row)
                const isSelected = effectiveSelectable && !!effectiveSelectedIds?.has(rowId)
                return (
                  <tr
                    key={rowId || i}
                    className={isSelected ? 'eq-table__row--selected' : ''}
                    data-clickable={onRowClick ? true : undefined}
                    style={rowStyle?.(row)}
                    onClick={() => onRowClick?.(row)}
                  >
                    {effectiveSelectable && (
                      <td
                        className="eq-table__col-check"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="eq-table__checkcell">
                          <span
                            className={[
                              'eq-table__chk',
                              isSelected ? 'eq-table__chk--on' : '',
                            ].filter(Boolean).join(' ')}
                            role="checkbox"
                            aria-checked={isSelected}
                            tabIndex={0}
                            onClick={e => { e.stopPropagation(); toggleRow(rowId) }}
                            onKeyDown={e => {
                              if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleRow(rowId) }
                            }}
                          >
                            <Check size={12} aria-hidden="true" />
                          </span>
                        </div>
                      </td>
                    )}

                    {visibleCols.map((col, colIdx) => {
                      const indicator = colIdx === 0 && rowIndicator ? rowIndicator(row) : null
                      const tdClass = ['eq-table__td', col.className].filter(Boolean).join(' ') || undefined
                      return (
                        <td
                          key={col.key}
                          className={tdClass}
                          style={{ textAlign: col.align ?? 'left', width: col.width }}
                        >
                          {colIdx === 0 && rowIndicator ? (
                            <div className="eq-table__cell-with-indicator">
                              <span
                                className={`eq-table__indicator${indicator ? ' eq-table__indicator--active' : ''}`}
                                aria-hidden="true"
                                style={indicator ? {
                                  background: indicator.color,
                                  boxShadow: `0 0 0 3px ${indicator.color}22`,
                                } : undefined}
                              />
                              <span>
                                {col.render
                                  ? col.render(row)
                                  : String((row as Record<string, unknown>)[col.key] ?? '')}
                              </span>
                            </div>
                          ) : (
                            col.render
                              ? col.render(row)
                              : String((row as Record<string, unknown>)[col.key] ?? '')
                          )}
                        </td>
                      )
                    })}

                    <td className="eq-table__col-chev">
                      <div className="eq-table__rowchev" aria-hidden="true">
                        <ChevronRight size={18} />
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Zone G — Footer */}
        {showFooter && (
          <div className="eq-table__foot">
            <div className="eq-table__foot-info">
              {summaryNode}
            </div>
            {pagination && totalPages > 1 && (
              <div className="eq-table__foot-right">
                <div className="eq-table__pager" role="navigation" aria-label="Pagination">
                  <button
                    className="eq-table__pg"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} aria-hidden="true" />
                  </button>

                  {buildPageRange(page, totalPages).map((p, i) =>
                    p === '…' ? (
                      <span key={`dots-${i}`} className="eq-table__pg eq-table__pg--dots">…</span>
                    ) : (
                      <button
                        key={p}
                        className={`eq-table__pg${p === page ? ' eq-table__pg--active' : ''}`}
                        onClick={() => setPage(p as number)}
                        aria-current={p === page ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    className="eq-table__pg"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Zone F — Bulk action bar */}
        {effectiveSelectable && effectiveBulkActions && (
          <div
            className={`eq-table__bulk-bar${selCount > 0 ? ' eq-table__bulk-bar--show' : ''}`}
            role="region"
            aria-label="Bulk actions"
            aria-hidden={selCount === 0}
          >
            <div className="eq-table__bulk-count">
              <span className="eq-table__bulk-pill">{selCount}</span>
              <span>selected</span>
            </div>
            <div className="eq-table__bulk-vr" aria-hidden="true" />
            <div className="eq-table__bulk-acts">
              {effectiveBulkActions(selectedRows, clearSelection)}
            </div>
            <div className="eq-table__bulk-vr" aria-hidden="true" />
            <button
              className="eq-table__bulk-close"
              aria-label="Clear selection"
              onClick={clearSelection}
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {confirmAction && (() => {
        const isDelete = confirmAction === 'delete'
        const cfg = isDelete
          ? deleteConfirm
          : (archiveConfirm && typeof archiveConfirm === 'object' ? archiveConfirm : undefined)
        const n = selCount
        const resolve = (val: string | ((n: number) => string) | undefined, fallback: string) =>
          val ? (typeof val === 'function' ? val(n) : val) : fallback
        const title = resolve(
          cfg?.title,
          isDelete
            ? `Delete ${n} ${n === 1 ? 'item' : 'items'}?`
            : `Archive ${n} ${n === 1 ? 'item' : 'items'}?`,
        )
        const description = resolve(
          cfg?.description,
          isDelete
            ? "This can't be undone."
            : 'These items will be moved to the archive.',
        )
        return (
          <ConfirmDialog
            open
            onClose={() => setConfirmAction(null)}
            onConfirm={handleConfirmedAction}
            title={title}
            description={description}
            confirmLabel={isDelete ? deleteLabel : archiveLabel}
            destructive={isDelete}
            loading={actionLoading}
          />
        )
      })()}
    </div>
  )
}

Table.displayName = 'Table'

export type { TableColumn as TableColumnDef }
