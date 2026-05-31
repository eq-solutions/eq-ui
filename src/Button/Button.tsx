import React, { ButtonHTMLAttributes, forwardRef } from 'react'
import './Button.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. Defaults to 'primary'. */
  variant?: ButtonVariant
  /** Height and padding tier. Defaults to 'md'. */
  size?: ButtonSize
  /**
   * When true, overlays a spinner and disables the button.
   * Children remain mounted so layout does not jump.
   * Pair with async actions (server actions, mutations) so every click
   * gives the user visible feedback.
   */
  loading?: boolean
  /**
   * Optional leading icon, rendered before the label. Pass a Lucide icon
   * (the EQ icon family) sized 16px — e.g. `icon={<Plus size={16} />}`.
   * Decorative: marked `aria-hidden`. For an icon-only button, also pass
   * `aria-label`.
   */
  icon?: React.ReactNode
}

/**
 * EQ canonical button.
 *
 * All styling references `--eq-*` CSS custom properties defined in
 * `@eq-solutions/tokens/tokens.css`. The consuming app must import
 * that file (or equivalent) so the properties are available on `:root`.
 *
 * @example
 * // primary (default)
 * <Button onClick={handleSave}>Save</Button>
 *
 * // secondary outline
 * <Button variant="secondary" size="sm">Cancel</Button>
 *
 * // ghost — toolbar actions
 * <Button variant="ghost">Settings</Button>
 *
 * // async loading state
 * <Button loading={isPending}>Save changes</Button>
 *
 * // leading icon (Lucide)
 * <Button icon={<Plus size={16} />}>New work order</Button>
 *
 * // danger confirmation
 * <Button variant="danger" onClick={handleDelete}>Delete</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) {
    const isDisabled = disabled || loading

    const classes = [
      'eq-btn',
      `eq-btn--${variant}`,
      `eq-btn--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <span className="eq-btn__loader" aria-hidden="true">
            <svg
              className={`eq-btn__spinner eq-btn__spinner--${size}`}
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeOpacity="0.25"
                strokeWidth="3"
              />
              <path
                d="M22 12a10 10 0 0 1-10 10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>
        )}
        <span
          className={`eq-btn__content${loading ? ' eq-btn__content--hidden' : ''}`}
        >
          {icon != null && (
            <span className="eq-btn__icon" aria-hidden="true">
              {icon}
            </span>
          )}
          {children}
        </span>
      </button>
    )
  }
)

Button.displayName = 'Button'
