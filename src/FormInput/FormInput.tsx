import React, { InputHTMLAttributes, forwardRef, useId } from 'react'
import './FormInput.css'

export interface FormInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Uppercase field label rendered above the input. */
  label?: string
  /**
   * Validation message. When set, the input switches to the error style and
   * the message is announced to assistive tech (`role="alert"`).
   */
  error?: string
  /** Helper text shown below the input. Hidden while an `error` is present. */
  hint?: string
}

/**
 * EQ canonical text field.
 *
 * Label + input + hint/error in one accessible block. The label is wired to
 * the input via `htmlFor`, and `aria-describedby` points at the hint or error
 * so screen readers read it. Pass any native `<input>` prop through.
 *
 * All styling references `--eq-*` custom properties from `@eq-solutions/tokens`.
 *
 * @example
 * <FormInput label="Site name" value={name} onChange={e => setName(e.target.value)} />
 *
 * // with hint
 * <FormInput label="Email" type="email" hint="We'll only use this to sign you in." />
 *
 * // error state
 * <FormInput label="PIN" error="That PIN doesn't match." />
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  function FormInput(
    { label, error, hint, id, className, disabled, ...props },
    ref
  ) {
    const autoId = useId()
    const inputId = id ?? autoId
    const describedById = error
      ? `${inputId}-error`
      : hint
        ? `${inputId}-hint`
        : undefined

    const wrapClass = ['eq-field', className].filter(Boolean).join(' ')
    const inputClass = ['eq-field__input', error && 'eq-field__input--error']
      .filter(Boolean)
      .join(' ')

    return (
      <div className={wrapClass} data-disabled={disabled || undefined}>
        {label && (
          <label className="eq-field__label" htmlFor={inputId}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={inputClass}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedById}
          {...props}
        />
        {error ? (
          <span id={`${inputId}-error`} className="eq-field__error" role="alert">
            {error}
          </span>
        ) : hint ? (
          <span id={`${inputId}-hint`} className="eq-field__hint">
            {hint}
          </span>
        ) : null}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'
