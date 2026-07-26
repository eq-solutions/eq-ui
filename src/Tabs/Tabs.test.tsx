import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs } from './Tabs'
import { axe } from '../test-utils/axe'

afterEach(cleanup)

const items = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open', count: 12 },
  { key: 'blocked', label: 'Blocked', disabled: true },
  { key: 'closed', label: 'Closed' },
]

function Harness({ onChange }: { onChange?: (key: string) => void }) {
  const [value, setValue] = useState('all')
  return (
    <Tabs
      items={items}
      value={value}
      onChange={(key) => {
        setValue(key)
        onChange?.(key)
      }}
      aria-label="Work orders"
    />
  )
}

describe('Tabs', () => {
  it('marks the active tab aria-selected + tabbable, others not', () => {
    render(<Harness />)
    const all = screen.getByRole('tab', { name: 'All' })
    const open = screen.getByRole('tab', { name: /Open/ })

    expect(all).toHaveAttribute('aria-selected', 'true')
    expect(all).toHaveAttribute('tabIndex', '0')
    expect(open).toHaveAttribute('aria-selected', 'false')
    expect(open).toHaveAttribute('tabIndex', '-1')
  })

  it('selects a tab on click, but disabled tabs are inert', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)

    await user.click(screen.getByRole('tab', { name: /Open/ }))
    expect(onChange).toHaveBeenCalledWith('open')

    onChange.mockClear()
    await user.click(screen.getByRole('tab', { name: 'Blocked' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('ArrowRight moves selection AND DOM focus to the next enabled tab, skipping disabled ones', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    screen.getByRole('tab', { name: 'All' }).focus()
    await user.keyboard('{ArrowRight}')
    // 'open' is next
    expect(screen.getByRole('tab', { name: /Open/ })).toHaveAttribute('aria-selected', 'true')
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: /Open/ }))

    await user.keyboard('{ArrowRight}')
    // 'blocked' is disabled — must skip straight to 'closed'
    expect(screen.getByRole('tab', { name: 'Closed' })).toHaveAttribute('aria-selected', 'true')
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Closed' }))
  })

  it('ArrowLeft wraps from the first tab to the last enabled tab', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    screen.getByRole('tab', { name: 'All' }).focus()
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('tab', { name: 'Closed' })).toHaveAttribute('aria-selected', 'true')
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Closed' }))
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<Harness />)
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
