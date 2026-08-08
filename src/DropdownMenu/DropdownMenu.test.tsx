import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DropdownMenu } from './DropdownMenu'
import { axe } from '../test-utils/axe'

afterEach(cleanup)

const items = [
  { key: 'dup', label: 'Duplicate', onClick: vi.fn() },
  { key: 'sep', separator: true as const },
  { key: 'trash', label: 'Move to trash', onClick: vi.fn(), variant: 'danger' as const },
]

function renderMenu(onDupClick = vi.fn()) {
  return render(
    <DropdownMenu
      trigger={<button aria-label="More">⋯</button>}
      items={[
        { key: 'dup', label: 'Duplicate', onClick: onDupClick },
        { key: 'sep', separator: true },
        { key: 'trash', label: 'Move to trash', onClick: vi.fn(), variant: 'danger' },
        { key: 'locked', label: 'Locked action', onClick: vi.fn(), disabled: true },
      ]}
    />
  )
}

describe('DropdownMenu', () => {
  it('is closed by default and opens on trigger click', async () => {
    const user = userEvent.setup()
    renderMenu()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await user.click(screen.getByLabelText('More'))
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(screen.getByLabelText('More'))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('closes on click outside', async () => {
    const user = userEvent.setup()
    render(
      <>
        <div data-testid="outside">outside</div>
        <DropdownMenu trigger={<button aria-label="More">⋯</button>} items={items} />
      </>
    )
    await user.click(screen.getByLabelText('More'))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    await user.click(screen.getByTestId('outside'))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('fires the item onClick and closes the menu, but skips disabled items', async () => {
    const user = userEvent.setup()
    const onDupClick = vi.fn()
    renderMenu(onDupClick)

    await user.click(screen.getByLabelText('More'))
    await user.click(screen.getByText('Locked action'))
    expect(screen.getByRole('menu')).toBeInTheDocument() // disabled item: no-op, stays open

    await user.click(screen.getByText('Duplicate'))
    expect(onDupClick).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('renders separators with role="separator"', async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(screen.getByLabelText('More'))
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('has no detectable accessibility violations while open', async () => {
    const user = userEvent.setup()
    const { container } = renderMenu()
    await user.click(screen.getByLabelText('More'))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    const results = await axe(container)
    expect(results.violations).toEqual([])
  })

  it('defaults to comfortable density and accepts compact', () => {
    const { container, rerender } = render(
      <DropdownMenu trigger={<button aria-label="More">⋯</button>} items={items} />
    )
    expect(container.querySelector('.eq-dropdown')).toHaveAttribute('data-density', 'comfortable')

    rerender(
      <DropdownMenu trigger={<button aria-label="More">⋯</button>} items={items} density="compact" />
    )
    expect(container.querySelector('.eq-dropdown')).toHaveAttribute('data-density', 'compact')
  })
})
