import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateRangePicker, type DateRange } from './DateRangePicker'
import { axe } from '../test-utils/axe'

afterEach(cleanup)

const EMPTY: DateRange = { start: null, end: null }

describe('DateRangePicker', () => {
  it('shows the placeholder when nothing is selected', () => {
    render(<DateRangePicker value={EMPTY} onChange={vi.fn()} placeholder="Pick a range" />)
    expect(screen.getByText('Pick a range')).toBeInTheDocument()
  })

  it('is closed by default and opens on trigger click', async () => {
    const user = userEvent.setup()
    render(<DateRangePicker value={EMPTY} onChange={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /select date range/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    render(<DateRangePicker value={EMPTY} onChange={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /select date range/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('picking a start then an end day commits the range and closes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const fixed = new Date(2026, 7, 15) // 15 Aug 2026
    render(<DateRangePicker value={{ start: fixed, end: null }} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /15 aug 2026/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '20' }))
    expect(onChange).toHaveBeenCalledWith({
      start: fixed,
      end: new Date(2026, 7, 20),
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('applies a preset and closes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DateRangePicker value={EMPTY} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /select date range/i }))
    await user.click(screen.getByRole('button', { name: 'Today' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    const range = onChange.mock.calls[0][0] as DateRange
    expect(range.start).not.toBeNull()
    expect(range.end).not.toBeNull()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('clears the range via the clear button without opening the popover', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <DateRangePicker
        value={{ start: new Date(2026, 7, 1), end: new Date(2026, 7, 5) }}
        onChange={onChange}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Clear date range' }))
    expect(onChange).toHaveBeenCalledWith(EMPTY)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('disables days outside min/max', async () => {
    const user = userEvent.setup()
    render(
      <DateRangePicker
        value={{ start: new Date(2026, 7, 15), end: null }}
        onChange={vi.fn()}
        min={new Date(2026, 7, 10)}
        max={new Date(2026, 7, 20)}
      />
    )
    await user.click(screen.getByRole('button', { name: /15 aug 2026/i }))
    expect(screen.getByRole('button', { name: '5' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '25' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '15' })).not.toBeDisabled()
  })

  it('defaults to comfortable density and accepts compact', () => {
    const { container, rerender } = render(<DateRangePicker value={EMPTY} onChange={vi.fn()} />)
    expect(container.querySelector('.eq-daterange')).toHaveAttribute('data-density', 'comfortable')

    rerender(<DateRangePicker value={EMPTY} onChange={vi.fn()} density="compact" />)
    expect(container.querySelector('.eq-daterange')).toHaveAttribute('data-density', 'compact')
  })

  it('has no detectable accessibility violations while open', async () => {
    const user = userEvent.setup()
    const { container } = render(<DateRangePicker label="Date range" value={EMPTY} onChange={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /select date range/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
