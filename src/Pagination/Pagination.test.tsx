import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from './Pagination'
import { axe } from '../test-utils/axe'

afterEach(cleanup)

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} pageCount={1} onPageChange={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders all pages when the range fits', () => {
    render(<Pagination page={2} pageCount={5} onPageChange={vi.fn()} />)
    ;[1, 2, 3, 4, 5].forEach((n) => expect(screen.getByLabelText(`Page ${n}`)).toBeInTheDocument())
  })

  it('collapses distant pages behind an ellipsis', () => {
    render(<Pagination page={1} pageCount={20} onPageChange={vi.fn()} />)
    expect(screen.getAllByText('…').length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Page 20')).toBeInTheDocument()
  })

  it('marks the current page with aria-current', () => {
    render(<Pagination page={3} pageCount={5} onPageChange={vi.fn()} />)
    expect(screen.getByLabelText('Page 3')).toHaveAttribute('aria-current', 'page')
  })

  it('disables prev on the first page and next on the last', () => {
    render(<Pagination page={1} pageCount={3} onPageChange={vi.fn()} />)
    expect(screen.getByLabelText('Previous page')).toBeDisabled()
    expect(screen.getByLabelText('Next page')).not.toBeDisabled()
  })

  it('calls onPageChange when a page is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination page={1} pageCount={5} onPageChange={onPageChange} />)
    await user.click(screen.getByLabelText('Page 3'))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<Pagination page={2} pageCount={5} onPageChange={vi.fn()} />)
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })

  it('defaults to comfortable density and accepts compact', () => {
    const { container, rerender } = render(
      <Pagination page={2} pageCount={5} onPageChange={vi.fn()} />
    )
    expect(container.querySelector('.eq-pagination')).toHaveAttribute('data-density', 'comfortable')

    rerender(<Pagination page={2} pageCount={5} onPageChange={vi.fn()} density="compact" />)
    expect(container.querySelector('.eq-pagination')).toHaveAttribute('data-density', 'compact')
  })
})
