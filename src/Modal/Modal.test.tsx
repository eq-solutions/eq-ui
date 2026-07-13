import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

afterEach(cleanup)

describe('Modal focus behaviour', () => {
  // Regression: consumers routinely pass an inline `onClose={() => setOpen(false)}`,
  // whose identity changes on every parent re-render. The focus/lock effect must
  // NOT depend on that identity, or each re-render yanks focus back to the first
  // field mid-typing (eq-shell LabourHireRates, 2026-07-13).
  it('does not move focus when the parent re-renders with a new onClose identity', () => {
    function Harness() {
      // Fresh `onClose` arrow every render — the footgun.
      return (
        <Modal open onClose={() => {}} aria-label="Edit rates">
          <input aria-label="rate-a" />
          <input aria-label="rate-b" />
        </Modal>
      )
    }

    const { rerender } = render(<Harness />)
    const second = screen.getByLabelText('rate-b') as HTMLInputElement
    second.focus()
    expect(document.activeElement).toBe(second)

    rerender(<Harness />)

    // Focus must stay put — not snap back to the first focusable.
    expect(document.activeElement).toBe(second)
  })

  it('keeps focus in the active field while typing, as onClose identity changes each keystroke', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [value, setValue] = useState('')
      return (
        <Modal open onClose={() => {}} aria-label="Edit rates">
          <input aria-label="rate-a" />
          <input
            aria-label="rate-b"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </Modal>
      )
    }

    render(<Harness />)
    const second = screen.getByLabelText('rate-b') as HTMLInputElement
    await user.click(second)
    await user.keyboard('Sydney')

    expect(second.value).toBe('Sydney')
    expect(document.activeElement).toBe(second)
  })

  it('closes on Escape using the latest onClose after a re-render', async () => {
    const user = userEvent.setup()
    const calls: string[] = []

    function Harness() {
      const [tick, setTick] = useState(0)
      return (
        <>
          <button onClick={() => setTick((t) => t + 1)}>bump</button>
          <Modal open onClose={() => calls.push(`close-${tick}`)} aria-label="dlg">
            <input aria-label="field" />
          </Modal>
        </>
      )
    }

    render(<Harness />)
    // Re-render so onClose closes over tick=1 (new identity, latest value).
    await user.click(screen.getByText('bump'))
    await user.keyboard('{Escape}')

    expect(calls).toEqual(['close-1'])
  })

  it('restores focus to the previously-focused element on close', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button onClick={() => setOpen(true)}>open</button>
          <Modal open={open} onClose={() => setOpen(false)} aria-label="dlg">
            <input aria-label="field" />
          </Modal>
        </>
      )
    }

    render(<Harness />)
    const opener = screen.getByText('open')
    await user.click(opener) // focuses the opener, then opens the modal
    expect(screen.getByLabelText('field')).toBe(document.activeElement)

    await user.keyboard('{Escape}')
    // Modal unmounted → focus returns to whatever was focused before it opened.
    expect(document.activeElement).toBe(opener)
  })

  it('traps Tab focus within the dialog', () => {
    render(
      <Modal open onClose={() => {}} aria-label="dlg">
        <button>first</button>
        <button>last</button>
      </Modal>
    )
    const first = screen.getByText('first')
    const last = screen.getByText('last')

    // Tab at the last node wraps to the first.
    last.focus()
    fireEvent.keyDown(last, { key: 'Tab' })
    expect(document.activeElement).toBe(first)

    // Shift+Tab at the first node wraps to the last.
    first.focus()
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
  })
})
