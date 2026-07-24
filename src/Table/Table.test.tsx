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
