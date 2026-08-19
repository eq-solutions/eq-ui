import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
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
