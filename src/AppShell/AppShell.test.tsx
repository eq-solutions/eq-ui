import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppShell } from './AppShell'
import { axe } from '../test-utils/axe'

afterEach(cleanup)

function renderSidebarMode() {
  return render(
    <AppShell sidebar={<nav aria-label="Primary">Sidebar</nav>}>
      <div>Content</div>
    </AppShell>
  )
}

describe('AppShell (sidebar mode)', () => {
  it('starts with the mobile drawer closed', () => {
    renderSidebarMode()
    expect(screen.getByLabelText('Open navigation')).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the drawer via the hamburger, and closes it via its own close button', async () => {
    const user = userEvent.setup()
    renderSidebarMode()

    await user.click(screen.getByLabelText('Open navigation'))
    expect(screen.getByLabelText('Open navigation')).toHaveAttribute('aria-expanded', 'true')

    await user.click(screen.getByLabelText('Close navigation'))
    expect(screen.getByLabelText('Open navigation')).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the drawer on Escape', async () => {
    const user = userEvent.setup()
    renderSidebarMode()

    await user.click(screen.getByLabelText('Open navigation'))
    expect(screen.getByLabelText('Open navigation')).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{Escape}')
    expect(screen.getByLabelText('Open navigation')).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the drawer on backdrop click', async () => {
    const user = userEvent.setup()
    const { container } = renderSidebarMode()

    await user.click(screen.getByLabelText('Open navigation'))
    const backdrop = container.querySelector('.eq-hub-drawer-backdrop')
    expect(backdrop).toBeTruthy()

    await user.click(backdrop as Element)
    expect(screen.getByLabelText('Open navigation')).toHaveAttribute('aria-expanded', 'false')
  })

  it('has no detectable accessibility violations, closed or open', async () => {
    // AppShell renders the sidebar twice (mobile drawer copy + desktop copy) and
    // lets CSS decide which one is visible per viewport (AppShell.css:470, a
    // `@media (max-width: 767px)` swap) — in a real browser only one is ever in
    // the a11y tree at a time. jsdom doesn't evaluate media queries, so with the
    // drawer open both copies appear simultaneously "visible" here, tripping
    // landmark-unique. That's a test-environment artifact, not a real duplicate.
    const axeOpts = { 'landmark-unique': { enabled: false } }
    const user = userEvent.setup()
    const { container } = renderSidebarMode()

    expect((await axe(container)).violations).toEqual([])

    await user.click(screen.getByLabelText('Open navigation'))
    expect((await axe(container, axeOpts)).violations).toEqual([])
  })
})

describe('AppShell (rail mode)', () => {
  it('renders the rail directly, with no hamburger/drawer', () => {
    render(
      <AppShell mode="rail" rail={<nav aria-label="Rail">Rail</nav>}>
        <div>Content</div>
      </AppShell>
    )
    expect(screen.getByLabelText('Rail')).toBeInTheDocument()
    expect(screen.queryByLabelText('Open navigation')).not.toBeInTheDocument()
  })
})
