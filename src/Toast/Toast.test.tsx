import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast } from './Toast'
import { axe } from '../test-utils/axe'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function Harness({
  duration,
  tone,
}: {
  duration?: number
  tone?: 'ok' | 'warn' | 'err' | 'info'
}) {
  const { toast } = useToast()
  return (
    <button
      onClick={() =>
        toast({ title: 'Saved', message: 'Work order updated.', duration, tone })
      }
    >
      fire
    </button>
  )
}

function renderHarness(duration?: number, tone?: 'ok' | 'warn' | 'err' | 'info') {
  return render(
    <ToastProvider>
      <Harness duration={duration} tone={tone} />
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

  it('uses role="alert" for error toasts so they interrupt', async () => {
    const user = userEvent.setup()
    renderHarness(undefined, 'err')
    await user.click(screen.getByText('fire'))

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
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

describe('Toast hydration', () => {
  it('server-renders without the notifications region (it is portalled after mount)', async () => {
    const { renderToString } = await import('react-dom/server')
    const html = renderToString(
      <ToastProvider>
        <p>page</p>
      </ToastProvider>
    )
    expect(html).toContain('page')
    expect(html).not.toContain('eq-toast__region')
  })

  it('hydrates server HTML without a mismatch, then adds the region', async () => {
    const { renderToString } = await import('react-dom/server')
    const { hydrateRoot } = await import('react-dom/client')
    const ui = (
      <ToastProvider>
        <p>page</p>
      </ToastProvider>
    )
    const container = document.createElement('div')
    container.innerHTML = renderToString(ui)
    document.body.appendChild(container)

    const errors: unknown[] = []
    let root!: ReturnType<typeof hydrateRoot>
    await act(async () => {
      root = hydrateRoot(container, ui, { onRecoverableError: (e) => errors.push(e) })
    })

    expect(errors).toEqual([])
    expect(document.querySelector('.eq-toast__region')).not.toBeNull()

    await act(async () => root.unmount())
    container.remove()
  })
})
