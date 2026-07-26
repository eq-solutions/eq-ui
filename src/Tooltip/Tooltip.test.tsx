import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tooltip } from './Tooltip'
import { axe } from '../test-utils/axe'

afterEach(cleanup)

describe('Tooltip', () => {
  it('is hidden by default and shows on hover', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Runs a check">
        <button>Check</button>
      </Tooltip>
    )
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    await user.hover(screen.getByText('Check'))
    expect(screen.getByRole('tooltip')).toHaveTextContent('Runs a check')

    await user.unhover(screen.getByText('Check'))
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows on focus and associates via aria-describedby', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Runs a check">
        <button>Check</button>
      </Tooltip>
    )
    await user.tab()
    const tooltip = screen.getByRole('tooltip')
    expect(screen.getByText('Check')).toHaveAttribute('aria-describedby', tooltip.id)
  })

  it('hides on Escape', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Runs a check">
        <button>Check</button>
      </Tooltip>
    )
    await user.tab()
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('has no detectable accessibility violations while open', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Tooltip content="Runs a check">
        <button>Check</button>
      </Tooltip>
    )
    await user.hover(screen.getByText('Check'))
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
