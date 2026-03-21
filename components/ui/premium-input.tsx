'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { X, Search, Mic } from 'lucide-react'

/* ── Premium Input ───────────────────────────────────────────────
 *  Floating-label input with focus glow, error/success states,
 *  character counter, clear button, and search variant.
 * ─────────────────────────────────────────────────────────────── */

/* ── Shared wrapper styles ── */
const wrapperBase = [
  'group/input relative w-full',
].join(' ')

const fieldBase = [
  'peer w-full bg-[var(--color-white)] dark:bg-[rgb(var(--card))]',
  'border border-[var(--color-border)] rounded-lg',
  'text-[16px] text-[var(--color-slate)]',
  'placeholder-transparent',
  'outline-none transition-all duration-200 ease-out',
  /* Focus glow */
  'focus:border-[var(--color-primary)]',
  'focus:shadow-[0_0_0_3px_rgba(61,129,120,0.15)]',
  /* Reduced motion */
  'motion-reduce:transition-none',
].join(' ')

const labelBase = [
  'absolute left-3 text-[var(--color-muted)] pointer-events-none',
  'transition-all duration-200 ease-out',
  'motion-reduce:transition-none',
  /* Floating position when peer is focused or has content */
  'peer-focus:text-[11px] peer-focus:top-1.5 peer-focus:text-[var(--color-primary)] peer-focus:font-medium',
  'peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:font-medium',
].join(' ')

/* ── Text Input ── */

export interface PremiumInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Floating label text */
  label?: string
  /** Helper text below the input */
  helperText?: string
  /** Error message — overrides helperText and shows error styling */
  error?: string
  /** Show success border styling */
  success?: boolean
  /** Show the clear (X) button when input has value */
  clearable?: boolean
  /** Called when the clear button is pressed */
  onClear?: () => void
}

const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      success,
      clearable = false,
      onClear,
      id: idProp,
      ...props
    },
    ref
  ) => {
    const autoId = React.useId()
    const id = idProp || autoId
    const hasError = !!error
    const [hasValue, setHasValue] = React.useState(
      !!props.value || !!props.defaultValue
    )

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0)
      props.onChange?.(e)
    }

    const handleClear = () => {
      setHasValue(false)
      onClear?.()
    }

    return (
      <div className={cn(wrapperBase, className)}>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            className={cn(
              fieldBase,
              label ? 'pt-5 pb-1.5 px-3 h-[52px]' : 'py-3 px-3 h-[44px]',
              hasError &&
                'border-[var(--color-red)] focus:border-[var(--color-red)] focus:shadow-[0_0_0_3px_rgba(197,48,48,0.15)]',
              success &&
                !hasError &&
                'border-[var(--color-green)] focus:border-[var(--color-green)] focus:shadow-[0_0_0_3px_rgba(39,103,73,0.15)]',
              clearable && hasValue && 'pr-10'
            )}
            placeholder={label || ' '}
            onChange={handleChange}
            aria-invalid={hasError || undefined}
            aria-describedby={
              hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined
            }
            {...props}
          />

          {/* Floating label */}
          {label && (
            <label
              htmlFor={id}
              className={cn(
                labelBase,
                'text-[15px] top-[15px]',
                hasError &&
                  'peer-focus:text-[var(--color-red)] peer-[:not(:placeholder-shown)]:text-[var(--color-red)]',
                success &&
                  !hasError &&
                  'peer-focus:text-[var(--color-green)] peer-[:not(:placeholder-shown)]:text-[var(--color-green)]'
              )}
            >
              {label}
            </label>
          )}

          {/* Clear button */}
          {clearable && hasValue && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'p-1 rounded-full',
                'bg-[var(--color-border)] hover:bg-[var(--color-muted)]',
                'text-[var(--color-muted)] hover:text-[var(--color-white)]',
                'transition-colors duration-150',
                'focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]'
              )}
              aria-label="Clear input"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Error message */}
        {hasError && (
          <p
            id={`${id}-error`}
            className="mt-1.5 text-[13px] text-[var(--color-red)] motion-reduce:transition-none animate-fade-in"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Helper text */}
        {!hasError && helperText && (
          <p
            id={`${id}-helper`}
            className="mt-1.5 text-[13px] text-[var(--color-muted)]"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
PremiumInput.displayName = 'PremiumInput'

/* ── Textarea ── */

export interface PremiumTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
  success?: boolean
  /** Show a character counter. Pass the max character count. */
  maxChars?: number
}

const PremiumTextarea = React.forwardRef<HTMLTextAreaElement, PremiumTextareaProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      success,
      maxChars,
      id: idProp,
      ...props
    },
    ref
  ) => {
    const autoId = React.useId()
    const id = idProp || autoId
    const hasError = !!error
    const [charCount, setCharCount] = React.useState(
      typeof props.value === 'string'
        ? props.value.length
        : typeof props.defaultValue === 'string'
          ? props.defaultValue.length
          : 0
    )

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      props.onChange?.(e)
    }

    const isOverLimit = maxChars ? charCount > maxChars : false

    return (
      <div className={cn(wrapperBase, className)}>
        <div className="relative">
          <textarea
            ref={ref}
            id={id}
            className={cn(
              fieldBase,
              'min-h-[120px] resize-y',
              label ? 'pt-6 pb-2 px-3' : 'py-3 px-3',
              hasError &&
                'border-[var(--color-red)] focus:border-[var(--color-red)] focus:shadow-[0_0_0_3px_rgba(197,48,48,0.15)]',
              success &&
                !hasError &&
                'border-[var(--color-green)] focus:border-[var(--color-green)] focus:shadow-[0_0_0_3px_rgba(39,103,73,0.15)]',
              isOverLimit &&
                'border-[var(--color-red)] focus:border-[var(--color-red)]'
            )}
            placeholder={label || ' '}
            onChange={handleChange}
            aria-invalid={hasError || isOverLimit || undefined}
            aria-describedby={
              hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined
            }
            {...props}
          />

          {label && (
            <label
              htmlFor={id}
              className={cn(
                labelBase,
                'text-[15px] top-[14px]',
                hasError &&
                  'peer-focus:text-[var(--color-red)] peer-[:not(:placeholder-shown)]:text-[var(--color-red)]'
              )}
            >
              {label}
            </label>
          )}
        </div>

        {/* Footer row: helper/error + counter */}
        <div className="flex items-start justify-between gap-2 mt-1.5">
          <div className="flex-1">
            {hasError && (
              <p
                id={`${id}-error`}
                className="text-[13px] text-[var(--color-red)]"
                role="alert"
              >
                {error}
              </p>
            )}
            {!hasError && helperText && (
              <p id={`${id}-helper`} className="text-[13px] text-[var(--color-muted)]">
                {helperText}
              </p>
            )}
          </div>
          {maxChars !== undefined && (
            <span
              className={cn(
                'text-[12px] tabular-nums shrink-0',
                isOverLimit
                  ? 'text-[var(--color-red)] font-medium'
                  : 'text-[var(--color-muted)]'
              )}
              aria-live="polite"
            >
              {charCount}/{maxChars}
            </span>
          )}
        </div>
      </div>
    )
  }
)
PremiumTextarea.displayName = 'PremiumTextarea'

/* ── Search Input ── */

export interface PremiumSearchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Called when the clear button is pressed */
  onClear?: () => void
  /** Show a voice button placeholder */
  showVoice?: boolean
}

const PremiumSearch = React.forwardRef<HTMLInputElement, PremiumSearchProps>(
  ({ className, onClear, showVoice = false, ...props }, ref) => {
    const [hasValue, setHasValue] = React.useState(
      !!props.value || !!props.defaultValue
    )

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0)
      props.onChange?.(e)
    }

    const handleClear = () => {
      setHasValue(false)
      onClear?.()
    }

    return (
      <div className={cn('relative w-full', className)}>
        {/* Search icon */}
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 size-[18px] text-[var(--color-muted)] pointer-events-none"
          aria-hidden="true"
        />

        <input
          ref={ref}
          type="search"
          className={cn(
            fieldBase,
            'h-[44px] pl-10 pr-10',
            'rounded-full',
            'bg-[var(--color-surface)]',
            '[&::-webkit-search-cancel-button]:hidden',
            '[&::-webkit-search-decoration]:hidden'
          )}
          placeholder={props.placeholder || 'Search...'}
          onChange={handleChange}
          {...props}
        />

        {/* Right slot: clear or voice */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {hasValue && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'p-1.5 rounded-full',
                'bg-[var(--color-border)] hover:bg-[var(--color-muted)]',
                'text-[var(--color-muted)] hover:text-[var(--color-white)]',
                'transition-colors duration-150',
                'focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]'
              )}
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
          {showVoice && !hasValue && (
            <button
              type="button"
              className={cn(
                'p-1.5 rounded-full',
                'text-[var(--color-muted)] hover:text-[var(--color-primary)]',
                'transition-colors duration-150',
                'focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]'
              )}
              aria-label="Voice search"
            >
              <Mic className="size-[18px]" />
            </button>
          )}
        </div>
      </div>
    )
  }
)
PremiumSearch.displayName = 'PremiumSearch'

export { PremiumInput, PremiumTextarea, PremiumSearch }
