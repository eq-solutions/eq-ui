import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { KindPill } from './KindPill'
import { axe } from '../test-utils/axe'

afterEach(cleanup)

describe('KindPill', () => {
  it('renders the default label for each kind', () => {
    render(<KindPill kind="preventive" />)
    expect(screen.getByText('Preventive')).toBeInTheDocument()
  })

  it('renders an override label instead of the default', () => {
    render(<KindPill kind="inspection" label="Audit" />)
    expect(screen.getByText('Audit')).toBeInTheDocument()
    expect(screen.queryByText('Inspection')).not.toBeInTheDocument()
  })

  it('defaults to comfortable density and accepts compact', () => {
    const { container, rerender } = render(<KindPill kind="corrective" />)
    expect(container.querySelector('.eq-kind')).toHaveAttribute('data-density', 'comfortable')

    rerender(<KindPill kind="corrective" density="compact" />)
    expect(container.querySelector('.eq-kind')).toHaveAttribute('data-density', 'compact')
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<KindPill kind="preventive" />)
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
