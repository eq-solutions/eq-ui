import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { Button } from './Button'
import { axe } from '../test-utils/axe'

afterEach(cleanup)

const buttonCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'Button.css'),
  'utf8'
) as string

describe('Button', () => {
  it('keeps its accessible name while loading', () => {
    // Regression for #56: children must stay in the a11y tree while the
    // spinner (aria-hidden) is showing.
    render(<Button loading>Save changes</Button>)
    expect(
      screen.getByRole('button', { name: 'Save changes' })
    ).toBeInTheDocument()
  })

  it('hides loading content with opacity, not visibility:hidden', () => {
    // jsdom does not apply imported component CSS to getComputedStyle, and
    // Vite's `?raw` returns empty here — lock the #56 contract against the
    // stylesheet source so a visibility:hidden revert fails CI.
    const block = buttonCss.match(
      /\.eq-btn__content--hidden\s*\{[^}]*\}/
    )?.[0]
    expect(block).toBeTruthy()
    // Strip comments — the block documents why visibility:hidden is wrong.
    const decls = (block as string).replace(/\/\*[\s\S]*?\*\//g, '')
    expect(decls).toMatch(/opacity\s*:\s*0/)
    expect(decls).not.toMatch(/visibility\s*:\s*hidden/)
  })

  it('sets aria-busy and disables when loading', () => {
    render(<Button loading>Save changes</Button>)
    const button = screen.getByRole('button', { name: 'Save changes' })
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()
  })

  it('does not set aria-busy when idle', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).not.toHaveAttribute(
      'aria-busy'
    )
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<Button>Save changes</Button>)
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
