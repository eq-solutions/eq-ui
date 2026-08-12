import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiSelect, type MultiSelectOption } from './MultiSelect'
import { axe } from '../test-utils/axe'

afterEach(cleanup)

const STATUS_OPTIONS: MultiSelectOption[] = [
  { value: 'open', label: 'Open', color: 'var(--eq-sky)' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'closed', label: 'Closed' },
  { value: 'await', label: 'Awaiting' },
]

describe('MultiSelect', () => {
  it('shows the placeholder when nothing is selected', () => {
    render(<MultiSelect options={STATUS_OPTIONS} value={[]} onChange={vi.fn()} placeholder="Any status" />)
    expect(screen.getByText('Any status')).toBeInTheDocument()
  })

  it('is closed by default and opens on trigger click', async () => {
    const user = userEvent.setup()
    render(<MultiSelect options={STATUS_OPTIONS} value={[]} onChange={vi.fn()} />)
    expect(screen.queryByRole('group')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('group')).toBeInTheDocument()
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    render(<MultiSelect options={STATUS_OPTIONS} value={[]} onChange={vi.fn()} />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('group')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('closes on click outside', async () => {
    const user = userEvent.setup()
    render(
      <>
        <div data-testid="outside">outside</div>
        <MultiSelect options={STATUS_OPTIONS} value={[]} onChange={vi.fn()} />
      </>
    )
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('group')).toBeInTheDocument()

    await user.click(screen.getByTestId('outside'))
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('checking an option calls onChange with it added', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<MultiSelect options={STATUS_OPTIONS} value={['open']} onChange={onChange} />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('checkbox', { name: 'Overdue' }))

    expect(onChange).toHaveBeenCalledWith(['open', 'overdue'])
  })

  it('unchecking a selected option calls onChange with it removed', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<MultiSelect options={STATUS_OPTIONS} value={['open', 'overdue']} onChange={onChange} />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('checkbox', { name: 'Open' }))

    expect(onChange).toHaveBeenCalledWith(['overdue'])
  })

  it('shows chips for 1-2 selections and a count for 3+', () => {
    const { rerender } = render(
      <MultiSelect options={STATUS_OPTIONS} value={['open', 'overdue']} onChange={vi.fn()} />
    )
    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.getByText('Overdue')).toBeInTheDocument()

    rerender(
      <MultiSelect
        options={STATUS_OPTIONS}
        value={['open', 'overdue', 'closed']}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText('3 selected')).toBeInTheDocument()
  })

  it('Clear calls onChange with an empty array', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<MultiSelect options={STATUS_OPTIONS} value={['open']} onChange={onChange} />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(onChange).toHaveBeenCalledWith([])
  })

  it('hides the search box under the threshold and shows it above', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <MultiSelect options={STATUS_OPTIONS} value={[]} onChange={vi.fn()} />
    )
    await user.click(screen.getByRole('button'))
    expect(screen.queryByPlaceholderText('Search')).not.toBeInTheDocument()
    await user.keyboard('{Escape}')

    const manyOptions = Array.from({ length: 10 }, (_, i) => ({ value: `v${i}`, label: `Option ${i}` }))
    rerender(<MultiSelect options={manyOptions} value={[]} onChange={vi.fn()} />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument()
  })

  it('search filters the option list', async () => {
    const user = userEvent.setup()
    const manyOptions = Array.from({ length: 10 }, (_, i) => ({ value: `v${i}`, label: `Option ${i}` }))
    render(<MultiSelect options={manyOptions} value={[]} onChange={vi.fn()} />)

    await user.click(screen.getByRole('button'))
    await user.type(screen.getByPlaceholderText('Search'), 'Option 3')

    expect(screen.getByRole('checkbox', { name: 'Option 3' })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'Option 1' })).not.toBeInTheDocument()
  })

  it('defaults to comfortable density and accepts compact', () => {
    const { container, rerender } = render(
      <MultiSelect options={STATUS_OPTIONS} value={[]} onChange={vi.fn()} />
    )
    expect(container.querySelector('.eq-multiselect')).toHaveAttribute('data-density', 'comfortable')

    rerender(<MultiSelect options={STATUS_OPTIONS} value={[]} onChange={vi.fn()} density="compact" />)
    expect(container.querySelector('.eq-multiselect')).toHaveAttribute('data-density', 'compact')
  })

  it('has no detectable accessibility violations while open', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MultiSelect label="Status" options={STATUS_OPTIONS} value={['open']} onChange={vi.fn()} />
    )
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('group')).toBeInTheDocument()

    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
