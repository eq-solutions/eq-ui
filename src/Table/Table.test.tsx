import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Table } from './Table'
import type { TableColumn } from './Table'

afterEach(cleanup)

interface Row {
  id: string
  location: string
  workOrder: string | null
  plan: string
}

const rows: Row[] = [
  { id: '1', location: 'Level 1', workOrder: null, plan: 'E1.24' },
  { id: '2', location: 'Level 1', workOrder: 'WO-1001', plan: 'E1.24' },
  { id: '3', location: 'Level 2', workOrder: 'WO-1001', plan: 'E1.24' },
  { id: '4', location: 'Level 2', workOrder: null, plan: 'E2.05' },
  { id: '5', location: 'Roof', workOrder: 'WO-1002', plan: 'E2.05' },
]

const columns: TableColumn<Row>[] = [
  { key: 'location', header: 'Location', filterable: 'multiselect' },
  { key: 'workOrder', header: 'Work Order', filterable: 'multiselect' },
  { key: 'plan', header: 'Plan', filterable: 'multiselect' },
]

describe('Table — column reorder', () => {
  it('moving a column down changes the rendered header order', async () => {
    const user = userEvent.setup()
    render(<Table rows={rows} columns={columns} getRowId={r => r.id} columnToggle />)

    await user.click(screen.getByRole('button', { name: 'Columns' }))
    await user.click(screen.getByRole('button', { name: 'Move Location down' }))

    const headers = screen.getAllByRole('columnheader').map(h => h.textContent)
    expect(headers.indexOf('Work Order')).toBeLessThan(headers.indexOf('Location'))
  })

  it('boundary move buttons are disabled at the ends', async () => {
    const user = userEvent.setup()
    render(<Table rows={rows} columns={columns} getRowId={r => r.id} columnToggle />)

    await user.click(screen.getByRole('button', { name: 'Columns' }))
    expect(screen.getByRole('button', { name: 'Move Location up' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Move Plan down' })).toBeDisabled()
  })

  it('renders the column-visibility menu as a direct child of document.body, not nested inside the table', async () => {
    // Regression test: the menu used to be position:absolute inside the
    // table's own DOM, which got clipped by any ancestor's overflow — most
    // visibly a short, filtered table inside a scrolling app shell. It's
    // now portalled to document.body so no ancestor's overflow can clip it.
    const user = userEvent.setup()
    render(<Table rows={rows} columns={columns} getRowId={r => r.id} columnToggle />)

    await user.click(screen.getByRole('button', { name: 'Columns' }))
    const menu = screen.getByRole('menu')

    expect(menu.parentElement).toBe(document.body)
    expect(menu.closest('.eq-table-wrap')).toBeNull()
  })
})

describe('Table — composite column filterValue/exportValue', () => {
  interface ContactRow {
    id: string
    name: string
    phone: string | null
    email: string | null
  }

  const contactRows: ContactRow[] = [
    { id: '1', name: 'Ann', phone: '0412345678', email: 'ann@example.com' },
    { id: '2', name: 'Bo', phone: null, email: 'bo@example.com' },
  ]

  const contactColumns: TableColumn<ContactRow>[] = [
    { key: 'name', header: 'Name' },
    {
      key: 'contact',
      header: 'Contact',
      filterable: 'text',
      filterValue: row => [row.phone, row.email].filter(Boolean).join(' '),
      exportValue: row => [row.phone, row.email].filter(Boolean).join(' | '),
      render: row => <>{row.phone}{row.email}</>,
    },
  ]

  it('global search matches against filterValue, not row[key]', async () => {
    const user = userEvent.setup()
    render(<Table rows={contactRows} columns={contactColumns} getRowId={r => r.id} globalSearch />)

    await user.type(screen.getByRole('textbox', { name: 'Search' }), '0412345678')
    const table = screen.getByRole('table')
    expect(within(table).queryByText('Ann')).toBeTruthy()
    expect(within(table).queryByText('Bo')).toBeNull()
  })

  // Regression: multiselect's option-derivation and row-matching both read
  // row[key] raw, ignoring filterValue — a composite column (no single
  // backing field, e.g. Contact = phone+email) could never work as
  // multiselect: options came back empty and no row ever matched
  // (eq-shell Staff table, 2026-08-20).
  it('multiselect uses filterValue for a composite column with no single backing field', async () => {
    const user = userEvent.setup()
    const multiContactColumns: TableColumn<ContactRow>[] = [
      { key: 'name', header: 'Name' },
      {
        key: 'contact',
        header: 'Contact',
        filterable: 'multiselect',
        filterValue: row => [row.phone, row.email].filter(Boolean).join(' '),
      },
    ]
    render(<Table rows={contactRows} columns={multiContactColumns} getRowId={r => r.id} />)

    await user.click(screen.getByRole('button', { name: 'Filter by Contact' }))
    expect(screen.queryByRole('checkbox', { name: /0412345678/ })).toBeTruthy()
    await user.click(screen.getByRole('checkbox', { name: /0412345678/ }))

    const table = screen.getByRole('table')
    expect(within(table).queryByText('Ann')).toBeTruthy()
    expect(within(table).queryByText('Bo')).toBeNull()
  })

  it('CSV export uses exportValue for composite columns', async () => {
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevoke = URL.revokeObjectURL
    let capturedBlob: Blob | null = null
    URL.createObjectURL = (blob: Blob) => { capturedBlob = blob; return 'blob:mock' }
    URL.revokeObjectURL = () => {}
    const originalClick = HTMLAnchorElement.prototype.click
    HTMLAnchorElement.prototype.click = function () {}

    render(<Table rows={contactRows} columns={contactColumns} getRowId={r => r.id} exportable />)
    screen.getByRole('button', { name: /Export/ }).click()

    expect(capturedBlob).not.toBeNull()
    const csv = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsText(capturedBlob!)
    })
    expect(csv).toContain('0412345678 | ann@example.com')
    expect(csv).toContain('"Bo","bo@example.com"')

    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevoke
    HTMLAnchorElement.prototype.click = originalClick
  })
})

describe('Table — multiselect header filter', () => {
  it('narrows rows to the OR of checked values within a column', async () => {
    const user = userEvent.setup()
    render(<Table rows={rows} columns={columns} getRowId={r => r.id} />)

    await user.click(screen.getByRole('button', { name: 'Filter by Location' }))
    await user.click(screen.getByRole('checkbox', { name: /Level 1/ }))
    await user.click(screen.getByRole('checkbox', { name: /Roof/ }))

    // 3 matching rows (2 Level 1 + 1 Roof) + header row = 4 rows in the table.
    const table = screen.getByRole('table')
    expect(within(table).getAllByRole('row')).toHaveLength(4)
  })

  // Regression: picking a value in one multiselect column must cascade into
  // what the OTHER multiselect columns' checklists offer, matching Excel
  // AutoFilter — a column's own selection should not shrink its own list
  // (eq-shell/eq-service, 2026-07-24).
  it('cascades: filtering one multiselect column narrows another column\'s checklist options', async () => {
    const user = userEvent.setup()
    render(<Table rows={rows} columns={columns} getRowId={r => r.id} />)

    await user.click(screen.getByRole('button', { name: 'Filter by Work Order' }))
    expect(screen.queryByRole('checkbox', { name: /WO-1001/ })).toBeTruthy()
    expect(screen.queryByRole('checkbox', { name: /WO-1002/ })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Filter by Work Order' })) // close

    await user.click(screen.getByRole('button', { name: 'Filter by Location' }))
    await user.click(screen.getByRole('checkbox', { name: /Level 1/ }))
    await user.click(screen.getByRole('button', { name: 'Filter by Location' })) // close

    await user.click(screen.getByRole('button', { name: 'Filter by Work Order' }))
    expect(screen.queryByRole('checkbox', { name: /WO-1001/ })).toBeTruthy()
    expect(screen.queryByRole('checkbox', { name: /WO-1002/ })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Filter by Work Order' })) // close

    await user.click(screen.getByRole('button', { name: 'Filter by Plan' }))
    expect(screen.queryByRole('checkbox', { name: /E1\.24/ })).toBeTruthy()
    expect(screen.queryByRole('checkbox', { name: /E2\.05/ })).toBeNull()
  })
})

describe('Table — loading debounce', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  // Regression: `loading` used to gate the skeleton directly, so a fetch that
  // resolves in well under 200ms (fast connection, warm cache) mounted and
  // unmounted the skeleton fast enough to read as a flash rather than a load
  // (admin tables, 2026-09-16).
  it('never shows the skeleton when loading resolves in under 200ms', () => {
    vi.useFakeTimers()
    const { rerender, container } = render(
      <Table rows={[]} columns={columns} getRowId={r => r.id} loading />
    )

    act(() => { vi.advanceTimersByTime(100) })
    rerender(<Table rows={rows} columns={columns} getRowId={r => r.id} loading={false} />)
    act(() => { vi.advanceTimersByTime(500) })

    expect(container.querySelectorAll('.eq-skeleton').length).toBe(0)
    expect(screen.getByText('Roof')).toBeInTheDocument()
  })

  it('still shows the skeleton once loading genuinely exceeds 200ms', () => {
    vi.useFakeTimers()
    const { container } = render(
      <Table rows={[]} columns={columns} getRowId={r => r.id} loading />
    )

    act(() => { vi.advanceTimersByTime(250) })

    expect(container.querySelectorAll('.eq-skeleton').length).toBeGreaterThan(0)
  })

  it('hides the skeleton immediately once loading clears, even mid-delay', () => {
    vi.useFakeTimers()
    const { rerender, container } = render(
      <Table rows={[]} columns={columns} getRowId={r => r.id} loading />
    )

    act(() => { vi.advanceTimersByTime(300) })
    expect(container.querySelectorAll('.eq-skeleton').length).toBeGreaterThan(0)

    rerender(<Table rows={rows} columns={columns} getRowId={r => r.id} loading={false} />)
    expect(container.querySelectorAll('.eq-skeleton').length).toBe(0)
    expect(screen.getByText('Roof')).toBeInTheDocument()
  })
})

describe('Table — mobile layout hooks', () => {
  // jsdom doesn't evaluate media queries, so these pin the DOM contract the
  // ≤767px CSS in Table.css relies on. The layouts themselves are verified
  // in the kitchen-sink preview at 375px.

  it('defaults to the scroll layout and wraps the table in a scroll container', () => {
    const { container } = render(<Table rows={rows} columns={columns} getRowId={r => r.id} />)
    const card = container.querySelector('.eq-table-card')!
    expect(card).toHaveAttribute('data-mobile-layout', 'scroll')
    expect(card.querySelector(':scope > .eq-table-scroll > table.eq-table')).not.toBeNull()
  })

  it('passes mobileLayout="cards" through to the card', () => {
    const { container } = render(
      <Table rows={rows} columns={columns} getRowId={r => r.id} mobileLayout="cards" />
    )
    expect(container.querySelector('.eq-table-card')).toHaveAttribute('data-mobile-layout', 'cards')
  })

  it('labels every data cell with its column header for the stacked card layout', () => {
    render(<Table rows={rows} columns={columns} getRowId={r => r.id} />)
    const firstRow = screen.getAllByRole('row')[1]
    const labels = within(firstRow).getAllByRole('cell')
      .map(c => c.getAttribute('data-label'))
      .filter(Boolean)
    expect(labels).toEqual(['Location', 'Work Order', 'Plan'])
  })

  it('marks the first visible data column as primary, following column hide/reorder', async () => {
    const user = userEvent.setup()
    render(<Table rows={rows} columns={columns} getRowId={r => r.id} columnToggle selectable selectedIds={new Set()} />)

    const primaryHeaders = () =>
      screen.getAllByRole('columnheader').filter(h => h.classList.contains('eq-table__col-primary'))
    expect(primaryHeaders().map(h => h.textContent)).toEqual(['Location'])
    // Checkbox cell is never the primary column.
    expect(screen.getAllByRole('row')[1].querySelector('.eq-table__col-check.eq-table__col-primary')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Columns' }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: /Location/ }))
    expect(primaryHeaders().map(h => h.textContent)).toEqual(['Work Order'])
  })

  it('flags selectable tables so the pinned column can offset past the checkbox', () => {
    const { container } = render(
      <Table rows={rows} columns={columns} getRowId={r => r.id} onDelete={() => {}} />
    )
    expect(container.querySelector('.eq-table-card')).toHaveAttribute('data-selectable', 'true')
  })

  it('tags hideOnMobile columns on both header and body cells', () => {
    const cols: TableColumn<Row>[] = [...columns.slice(0, 2), { key: 'plan', header: 'Plan', hideOnMobile: true }]
    const { container } = render(<Table rows={rows} columns={cols} getRowId={r => r.id} />)
    const hidden = container.querySelectorAll('.eq-table__col--hide-mobile')
    expect(hidden.length).toBe(1 + rows.length)
    hidden.forEach(el => expect(el.textContent).toMatch(/Plan|E\d/))
  })

  it('renders a checkbox placeholder in skeleton rows when built-in actions enable selection', () => {
    vi.useFakeTimers()
    const { container } = render(
      <Table rows={[]} columns={columns} getRowId={r => r.id} onDelete={() => {}} loading />
    )
    act(() => { vi.advanceTimersByTime(250) })
    const skeletonRow = container.querySelector('tbody tr[aria-hidden="true"]')!
    // header has checkbox + 3 data + chevron = 5 cells; skeleton rows must match.
    expect(skeletonRow.children.length).toBe(5)
    vi.useRealTimers()
  })
})

describe('Table — selection a11y', () => {
  it('gives the select-all and per-row checkboxes accessible names', () => {
    render(<Table rows={rows} columns={columns} getRowId={r => r.id} selectable selectedIds={new Set()} />)
    expect(screen.getByRole('checkbox', { name: 'Select all rows' })).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox', { name: 'Select row' })).toHaveLength(rows.length)
  })
})
