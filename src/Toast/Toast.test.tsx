import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast } from './Toast'
import { axe } from '../test-utils/axe'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function Harness({ duration }: { duration?: number }) {
  const { toast } = useToast()
  return (
    <button onClick={() => toast({ title: 'Saved', message: 'Work order updated.', duration })}>
      fire
    </button>
  )
}

function renderHarness(duration?: number) {
  return render(
    <ToastProvider>
      <Harness duration={duration} />
    </ToastProvider>
  )
}

describe('Toast', () => {
  it('renders in an aria-live region with role="status"', async () => {
    const user = userEvent.setup()
    renderHarness()
    await user.click(screen.getByText('fire'))

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Saved')).toBeInTheDocument()
    expect(screen.getByText('Work order updated.')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Notifications' })).toHaveAttribute(
      'aria-live',
      'polite'
    )
  })

  it('auto-dismisses after the default 4s duration', () => {
    vi.useFakeTimers()
    renderHarness()

    fireEvent.click(screen.getByText('fire'))
    expect(screen.getByRole('status')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(4000)
    })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('persists indefinitely when duration is 0', () => {
    vi.useFakeTimers()
    renderHarness(0)

    fireEvent.click(screen.getByText('fire'))
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('dismisses on manual close, cancelling the pending auto-dismiss timer', async () => {
    const user = userEvent.setup()
    renderHarness()

    await user.click(screen.getByText('fire'))
    await user.click(screen.getByLabelText('Dismiss notification'))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('has no detectable accessibility violations', async () => {
    const user = userEvent.setup()
    renderHarness()
    await user.click(screen.getByText('fire'))

    const results = await axe(document.body)
    expect(results.violations).toEqual([])
  })
})
