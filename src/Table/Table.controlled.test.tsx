import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Table } from './Table'
import type { TableColumn, TableSlicer } from './Table'

afterEach(cleanup)

interface Person {
  id: string
  name: string
  dept: 'eng' | 'ops'
  status: 'active' | 'left'
  email: string
}

const people: Person[] = [
  { id: 'p1', name: 'Ann', dept: 'eng', status: 'active', email: 'ann@secret.test' },
  { id: 'p2', name: 'Bo', dept: 'eng', status: 'left', email: 'bo@x.test' },
  { id: 'p3', name: 'Cy', dept: 'ops', status: 'active', email: 'cy@x.test' },
]

const columns: TableColumn<Person>[] = [
  { key: 'name', header: 'Name' },
  { key: 'dept', header: 'Dept' },
]

const slicers: TableSlicer<Person>[] = [
  { key: 'all', label: 'Everyone' },
  { key: 'mine', label: 'Mine', filter: r => r.name === 'Ann' },
  { key: 'eng', label: 'Eng', group: 'Department', filter: r => r.dept === 'eng' },
  { key: 'ops', label: 'Ops', group: 'Department', filter: r => r.dept === 'ops' },
  { key: 'active', label: 'Active', group: 'Status', filter: r => r.status === 'active' },
  { key: 'left', label: 'Left', group: 'Status', filter: r => r.status === 'left' },
]

const getId = (r: Person) => r.id
const body = () => screen.queryAllByRole('row').slice(1).map(r => r.textContent).join('|')
const search = () => screen.getByRole('textbox', { name: 'Search' })

describe('Table — searchText', () => {
  it('matches text outside the visible columns', async () => {
    const user = userEvent.setup()
    render(<Table rows={people} columns={columns} getRowId={getId} globalSearch searchText={r => r.email} />)
    await user.type(search(), 'secret')
    expect(body()).toContain('Ann')
    expect(body()).not.toContain('Bo')
  })

  it('does not match off-column text when omitted', async () => {
    const user = userEvent.setup()
    render(<Table rows={people} columns={columns} getRowId={getId} globalSearch />)
    await user.type(search(), 'secret')
    expect(screen.getByText('No results match your filters.')).toBeInTheDocument()
  })
})

describe('Table — controlled search', () => {
  it('filters by `query` and keeps showing it until the parent changes it', async () => {
    const user = userEvent.setup()
    const onQueryChange = vi.fn()
    const { rerender } = render(
      <Table rows={people} columns={columns} getRowId={getId} globalSearch query="bo" onQueryChange={onQueryChange} />
    )
    expect(body()).toContain('Bo')
    expect(body()).not.toContain('Ann')

    await user.type(search(), 'x')
    expect(onQueryChange).toHaveBeenCalledWith('box')
    expect(search()).toHaveValue('bo')

    rerender(<Table rows={people} columns={columns} getRowId={getId} globalSearch query="cy" onQueryChange={onQueryChange} />)
    expect(body()).toContain('Cy')
    expect(body()).not.toContain('Bo')
  })

  it('applies `query` even without globalSearch', () => {
    render(<Table rows={people} columns={columns} getRowId={getId} query="cy" />)
    expect(body()).toContain('Cy')
    expect(body()).not.toContain('Ann')
  })

  it('uncontrolled search still notifies onQueryChange', async () => {
    const user = userEvent.setup()
    const onQueryChange = vi.fn()
    render(<Table rows={people} columns={columns} getRowId={getId} globalSearch onQueryChange={onQueryChange} />)
    await user.type(search(), 'a')
    expect(onQueryChange).toHaveBeenLastCalledWith('a')
    expect(body()).not.toContain('Bo')
  })
})

describe('Table — controlled hidden columns', () => {
  afterEach(() => window.localStorage.clear())

  const headers = () => screen.getAllByRole('columnheader').map(h => h.textContent)

  it('hides the given columns and overrides defaultHiddenColumns and persistKey', () => {
    window.localStorage.setItem('eq-table-hidden-cols:t', JSON.stringify(['name']))
    render(
      <Table
        rows={people} columns={columns} getRowId={getId}
        hiddenColumns={['dept']} defaultHiddenColumns={['name']} persistKey="t"
      />
    )
    expect(headers()).toContain('Name')
    expect(headers()).not.toContain('Dept')
  })

  it('reports the next hidden set on toggle without changing itself or storage', async () => {
    const user = userEvent.setup()
    const onHiddenColumnsChange = vi.fn()
    render(
      <Table
        rows={people} columns={columns} getRowId={getId} columnToggle persistKey="t"
        hiddenColumns={['dept']} onHiddenColumnsChange={onHiddenColumnsChange}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Columns' }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: /Name/ }))
    expect(onHiddenColumnsChange).toHaveBeenCalledWith(['dept', 'name'])
    expect(headers()).toContain('Name')
    expect(window.localStorage.getItem('eq-table-hidden-cols:t')).toBeNull()
  })

  it('uncontrolled toggle still works and notifies', async () => {
    const user = userEvent.setup()
    const onHiddenColumnsChange = vi.fn()
    render(
      <Table
        rows={people} columns={columns} getRowId={getId} columnToggle
        onHiddenColumnsChange={onHiddenColumnsChange}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Columns' }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: /Dept/ }))
    expect(onHiddenColumnsChange).toHaveBeenCalledWith(['dept'])
    expect(headers()).not.toContain('Dept')
  })
})

describe('Table — grouped slicers', () => {
  it('renders one dropdown per group and keeps ungrouped slicers as chips', () => {
    render(<Table rows={people} columns={columns} getRowId={getId} slicers={slicers} />)
    expect(screen.getByRole('button', { name: /Everyone/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Mine/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Eng/ })).toBeNull()
    expect(screen.getByRole('combobox', { name: 'Department' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Status' })).toBeInTheDocument()
  })

  it('single choice per group, AND across groups, "All" clears a group', async () => {
    const user = userEvent.setup()
    render(<Table rows={people} columns={columns} getRowId={getId} slicers={slicers} />)

    await user.selectOptions(screen.getByRole('combobox', { name: 'Department' }), 'eng')
    expect(body()).toContain('Ann')
    expect(body()).toContain('Bo')
    expect(body()).not.toContain('Cy')

    await user.selectOptions(screen.getByRole('combobox', { name: 'Status' }), 'active')
    expect(body()).toContain('Ann')
    expect(body()).not.toContain('Bo')

    await user.selectOptions(screen.getByRole('combobox', { name: 'Department' }), 'ops')
    expect(body()).toContain('Cy')
    expect(body()).not.toContain('Ann')

    await user.selectOptions(screen.getByRole('combobox', { name: 'Department' }), '')
    expect(body()).toContain('Ann')
    expect(body()).toContain('Cy')
    expect(body()).not.toContain('Bo')
  })

  it('combines with an active chip slicer by AND', async () => {
    const user = userEvent.setup()
    render(<Table rows={people} columns={columns} getRowId={getId} slicers={slicers} />)
    await user.click(screen.getByRole('button', { name: /Mine/ }))
    await user.selectOptions(screen.getByRole('combobox', { name: 'Department' }), 'ops')
    expect(screen.getByText('No results match your filters.')).toBeInTheDocument()
  })

  it('does not let a grouped slicer become the default chip', () => {
    render(<Table rows={people} columns={columns} getRowId={getId} slicers={slicers.filter(s => s.group)} />)
    expect(body()).toContain('Ann')
    expect(body()).toContain('Bo')
    expect(body()).toContain('Cy')
  })
})

describe('Table — toolbar slots', () => {
  it('renders toolbar and toolbarEnd inside the toolbar row, and alone they show the toolbar', () => {
    const { container } = render(
      <Table
        rows={people} columns={columns} getRowId={getId}
        toolbar={<span data-testid="mid">mid</span>} toolbarEnd={<span data-testid="end">end</span>}
      />
    )
    const bar = container.querySelector('.eq-table-toolbar')!
    expect(bar).not.toBeNull()
    expect(bar).toContainElement(screen.getByTestId('mid'))
    expect(bar.querySelector('.eq-table-toolbar__right')).toContainElement(screen.getByTestId('end'))
  })

  it('renders no toolbar when no toolbar-bearing prop is given', () => {
    const { container } = render(<Table rows={people} columns={columns} getRowId={getId} />)
    expect(container.querySelector('.eq-table-toolbar')).toBeNull()
  })
})

describe('Table — emptyMessage', () => {
  it('accepts a ReactNode', () => {
    render(<Table rows={[]} columns={columns} getRowId={getId} emptyMessage={<em data-testid="empty">Nobody here</em>} />)
    expect(screen.getByTestId('empty')).toHaveTextContent('Nobody here')
  })

  it('still defaults to the plain string', () => {
    render(<Table rows={[]} columns={columns} getRowId={getId} />)
    expect(screen.getByText('No data to display.')).toBeInTheDocument()
  })
})

describe('Table — shown count and Clear filters', () => {
  it('is hidden while nothing is filtered', () => {
    render(<Table rows={people} columns={columns} getRowId={getId} globalSearch slicers={slicers} />)
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Clear filters' })).toBeNull()
  })

  it('shows "N of M shown" and clears search, groups and chips (uncontrolled)', async () => {
    const user = userEvent.setup()
    render(<Table rows={people} columns={columns} getRowId={getId} globalSearch slicers={slicers} />)

    await user.type(search(), 'o')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Department' }), 'eng')
    await user.click(screen.getByRole('button', { name: /Mine/ }))
    expect(screen.getByRole('status')).toHaveTextContent('0 of 3 shown')

    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.queryByRole('status')).toBeNull()
    expect(search()).toHaveValue('')
    expect(screen.getByRole('combobox', { name: 'Department' })).toHaveValue('')
    expect(screen.getByRole('button', { name: /Everyone/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByRole('row')).toHaveLength(4)
  })

  it('counts a controlled query and clears it through onQueryChange', async () => {
    const user = userEvent.setup()
    const onQueryChange = vi.fn()
    render(<Table rows={people} columns={columns} getRowId={getId} globalSearch query="ann" onQueryChange={onQueryChange} />)
    expect(screen.getByRole('status')).toHaveTextContent('1 of 3 shown')
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(onQueryChange).toHaveBeenCalledWith('')
  })

  it('resets a controlled active slicer to the default via onSlicerChange', async () => {
    const user = userEvent.setup()
    const onSlicerChange = vi.fn()
    render(
      <Table
        rows={people} columns={columns} getRowId={getId}
        slicers={slicers} activeSlicer="mine" onSlicerChange={onSlicerChange}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(onSlicerChange).toHaveBeenCalledWith('all')
  })

  it('opts out with showClearFilters={false}', async () => {
    const user = userEvent.setup()
    render(<Table rows={people} columns={columns} getRowId={getId} globalSearch showClearFilters={false} />)
    await user.type(search(), 'ann')
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Clear filters' })).toBeNull()
  })

  it('does not add a toolbar to tables that have none', () => {
    const { container } = render(<Table rows={people} columns={columns} getRowId={getId} query="ann" />)
    expect(container.querySelector('.eq-table-toolbar')).toBeNull()
  })
})
