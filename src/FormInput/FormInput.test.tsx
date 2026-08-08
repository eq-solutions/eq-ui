import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { FormInput } from './FormInput'
import { axe } from '../test-utils/axe'

afterEach(cleanup)

describe('FormInput', () => {
  it('wires the label to the input via htmlFor', () => {
    render(<FormInput label="Site name" />)
    expect(screen.getByLabelText('Site name')).toBeInTheDocument()
  })

  it('shows the hint and wires aria-describedby', () => {
    render(<FormInput label="Email" hint="We'll only use this to sign you in." />)
    const input = screen.getByLabelText('Email')
    expect(screen.getByText("We'll only use this to sign you in.")).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('hint'))
  })

  it('switches to the error style and hides the hint when error is set', () => {
    render(<FormInput label="PIN" hint="4 digits" error="That PIN doesn't match." />)
    expect(screen.getByRole('alert')).toHaveTextContent("That PIN doesn't match.")
    expect(screen.queryByText('4 digits')).not.toBeInTheDocument()
    expect(screen.getByLabelText('PIN')).toHaveAttribute('aria-invalid', 'true')
  })

  it('defaults to comfortable density and accepts compact', () => {
    const { container, rerender } = render(<FormInput label="Site name" />)
    expect(container.querySelector('.eq-field')).toHaveAttribute('data-density', 'comfortable')

    rerender(<FormInput label="Site name" density="compact" />)
    expect(container.querySelector('.eq-field')).toHaveAttribute('data-density', 'compact')
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = render(
      <FormInput label="Site name" hint="Shown to the whole team." />
    )
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
