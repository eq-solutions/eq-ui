import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'
import { axe } from '../test-utils/axe'

afterEach(cleanup)

describe('EmptyState', () => {
  it('renders title, description and action', () => {
    render(
      <EmptyState
        title="No job numbers added yet"
        description="Job numbers you add will show up here for the whole team."
        action={<button>Add job number</button>}
      />
    )
    expect(screen.getByText('No job numbers added yet')).toBeInTheDocument()
    expect(screen.getByText(/show up here/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add job number' })).toBeInTheDocument()
  })

  it('omits description and action when not provided', () => {
    render(<EmptyState title="Nothing here" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = render(
      <EmptyState title="No job numbers added yet" action={<button>Add</button>} />
    )
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })

  it('defaults to the default variant with no icon', () => {
    const { container } = render(<EmptyState title="Nothing here" />)
    expect(container.querySelector('.eq-empty')).toHaveAttribute('data-variant', 'default')
    expect(container.querySelector('.eq-empty__icon')).not.toBeInTheDocument()
  })

  it.each(['filtered', 'error', 'no-access'] as const)(
    'renders a default icon for the %s variant',
    (variant) => {
      const { container } = render(<EmptyState variant={variant} title="Nothing here" />)
      expect(container.querySelector('.eq-empty')).toHaveAttribute('data-variant', variant)
      expect(container.querySelector('.eq-empty__icon')).toBeInTheDocument()
    }
  )

  it('lets an explicit icon override the variant default', () => {
    render(
      <EmptyState variant="error" icon={<span data-testid="custom-icon" />} title="Nothing here" />
    )
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('has no detectable accessibility violations for the error variant', async () => {
    const { container } = render(
      <EmptyState
        variant="error"
        title="Couldn't load job numbers"
        action={<button>Try again</button>}
      />
    )
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
