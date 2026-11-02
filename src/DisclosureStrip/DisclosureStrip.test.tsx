import { createRef, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DisclosureStrip } from './DisclosureStrip'
import { axe } from '../test-utils/axe'

afterEach(cleanup)

describe('DisclosureStrip', () => {
  it('starts collapsed and toggles on click', async () => {
    const user = userEvent.setup()
    render(<DisclosureStrip title="Needs attention" count={3}>Body</DisclosureStrip>)
    const button = screen.getByRole('button', { name: /needs attention/i })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('Body')).not.toBeVisible()
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Body')).toBeVisible()
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('honours defaultOpen', () => {
    render(<DisclosureStrip title="T" defaultOpen>Body</DisclosureStrip>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Body')).toBeVisible()
  })

  it('toggles with Enter and Space', async () => {
    const user = userEvent.setup()
    render(<DisclosureStrip title="T">Body</DisclosureStrip>)
    const button = screen.getByRole('button')
    button.focus()
    await user.keyboard('{Enter}')
    expect(button).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard(' ')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('wires aria-controls to a labelled region', () => {
    render(<DisclosureStrip title="Needs attention" defaultOpen>Body</DisclosureStrip>)
    const button = screen.getByRole('button')
    const panel = document.getElementById(button.getAttribute('aria-controls')!)
    expect(panel).not.toBeNull()
    expect(panel).toHaveAttribute('role', 'region')
    expect(panel).toHaveAttribute('aria-labelledby', button.id)
    expect(screen.getByRole('region', { name: /needs attention/i })).toBe(panel)
  })

  it('renders the count only when provided', () => {
    const { rerender } = render(<DisclosureStrip title="T" count={0} />)
    expect(screen.getByRole('button')).toHaveTextContent('T0')
    rerender(<DisclosureStrip title="T" />)
    expect(screen.getByRole('button')).toHaveTextContent(/^T$/)
  })

  it('is controlled when `open` is passed', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <DisclosureStrip title="T" open={false} onOpenChange={onOpenChange}>Body</DisclosureStrip>
    )
    const button = screen.getByRole('button')
    await user.click(button)
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(button).toHaveAttribute('aria-expanded', 'false')
    rerender(<DisclosureStrip title="T" open onOpenChange={onOpenChange}>Body</DisclosureStrip>)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    await user.click(button)
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('works with a state-owning parent', async () => {
    const user = userEvent.setup()
    function Parent() {
      const [open, setOpen] = useState(false)
      return <DisclosureStrip title="T" open={open} onOpenChange={setOpen}>Body</DisclosureStrip>
    }
    render(<Parent />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Body')).toBeVisible()
  })

  it('calls onOpenChange when uncontrolled too', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<DisclosureStrip title="T" onOpenChange={onOpenChange} />)
    await user.click(screen.getByRole('button'))
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('applies tone classes (attention default, info)', () => {
    const { container, rerender } = render(<DisclosureStrip title="T" />)
    expect(container.firstChild).toHaveClass('eq-disclosure-strip--attention')
    rerender(<DisclosureStrip title="T" tone="info" />)
    expect(container.firstChild).toHaveClass('eq-disclosure-strip--info')
    expect(container.firstChild).not.toHaveClass('eq-disclosure-strip--attention')
  })

  it('forwards ref, className and rest props', () => {
    const ref = createRef<HTMLDivElement>()
    render(<DisclosureStrip ref={ref} title="T" className="extra" data-testid="strip" />)
    expect(ref.current).toBe(screen.getByTestId('strip'))
    expect(ref.current).toHaveClass('eq-disclosure-strip', 'extra')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <DisclosureStrip title="Needs attention" count={2} defaultOpen>Body</DisclosureStrip>
    )
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
