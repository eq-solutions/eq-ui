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

  it('renders a hint and announces it as the item description', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu
        trigger={<button aria-label="More">⋯</button>}
        items={[{ key: 'pack', label: 'Compliance pack', hint: 'PDF of all licences', onClick: vi.fn() }]}
      />
    )
    await user.click(screen.getByLabelText('More'))
    expect(screen.getByText('PDF of all licences')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Compliance pack/ })).toHaveAccessibleDescription(
      'PDF of all licences'
    )
  })

  it('uses menuitemcheckbox with aria-checked when checked is defined', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <DropdownMenu
        trigger={<button aria-label="More">⋯</button>}
        items={[
          { key: 'a', label: 'Name', checked: true, onClick: vi.fn() },
          { key: 'b', label: 'Phone', checked: false, onClick: vi.fn() },
          { key: 'c', label: 'Plain', onClick: vi.fn() },
        ]}
      />
    )
    await user.click(screen.getByLabelText('More'))
    expect(screen.getByRole('menuitemcheckbox', { name: 'Name' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('menuitemcheckbox', { name: 'Phone' })).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByRole('menuitem', { name: 'Plain' })).not.toHaveAttribute('aria-checked')

    rerender(
      <DropdownMenu
        trigger={<button aria-label="More">⋯</button>}
        items={[{ key: 'b', label: 'Phone', checked: true, onClick: vi.fn() }]}
      />
    )
    expect(screen.getByRole('menuitemcheckbox', { name: 'Phone' })).toHaveAttribute('aria-checked', 'true')
  })

  it('keepOpen runs onClick and leaves the menu open', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <DropdownMenu
        trigger={<button aria-label="More">⋯</button>}
        items={[{ key: 'a', label: 'Name', checked: false, keepOpen: true, onClick }]}
      />
    )
    await user.click(screen.getByLabelText('More'))
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Name' }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Name' }))
    expect(onClick).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('supports arrow/Home/End navigation, skipping disabled items', async () => {
    const user = userEvent.setup()
    renderMenu()
    screen.getByLabelText('More').focus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Move to trash' })).toHaveFocus()
    await user.keyboard('{ArrowDown}') // Locked action is disabled → wraps to first
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('menuitem', { name: 'Move to trash' })).toHaveFocus()
    await user.keyboard('{Home}')
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus()
    await user.keyboard('{End}')
    expect(screen.getByRole('menuitem', { name: 'Move to trash' })).toHaveFocus()
  })

  it('returns focus to the trigger on Escape and on item select', async () => {
    const user = userEvent.setup()
    renderMenu()
    const trigger = screen.getByLabelText('More')
    await user.click(trigger)
    await user.keyboard('{ArrowDown}{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()

    await user.click(trigger)
    await user.click(screen.getByText('Duplicate'))
    expect(trigger).toHaveFocus()
  })

  it('keeps danger styling with hint, checked and keepOpen, and has no axe violations', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <DropdownMenu
        trigger={<button aria-label="More">⋯</button>}
        items={[
          { key: 'a', label: 'Remove', hint: 'Cannot be undone', checked: true, keepOpen: true, variant: 'danger', onClick: vi.fn() },
        ]}
      />
    )
    await user.click(screen.getByLabelText('More'))
    expect(screen.getByRole('menuitemcheckbox')).toHaveClass('eq-dropdown__item--danger')
    expect((await axe(container)).violations).toEqual([])
  })
})
