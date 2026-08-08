import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'
import { axe } from '../test-utils/axe'

afterEach(cleanup)

describe('StatusBadge', () => {
  it('renders the default label for each status', () => {
    render(<StatusBadge status="in-progress" />)
    expect(screen.getByText('In progress')).toBeInTheDocument()
  })

  it('renders an override label instead of the default', () => {
    render(<StatusBadge status="closed" label="Done" />)
    expect(screen.getByText('Done')).toBeInTheDocument()
    expect(screen.queryByText('Closed')).not.toBeInTheDocument()
  })

  it('defaults to comfortable density and accepts compact', () => {
    const { container, rerender } = render(<StatusBadge status="open" />)
    expect(container.querySelector('.eq-badge')).toHaveAttribute('data-density', 'comfortable')

    rerender(<StatusBadge status="open" density="compact" />)
    expect(container.querySelector('.eq-badge')).toHaveAttribute('data-density', 'compact')
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<StatusBadge status="overdue" />)
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
