'use client'

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`ui-button ui-button-${variant} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`ui-field w-full ${className}`} {...props} />
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`ui-field w-full ${className}`} {...props} />
}

export function Textarea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`ui-field min-h-28 w-full py-3 ${className}`} {...props} />
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-semibold text-[var(--color-text-primary)]"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-[var(--color-error)]" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
      ) : null}
    </div>
  )
}

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`ui-card ${className}`}>{children}</div>
}

export function Badge({ className = '', children }: { className?: string; children: ReactNode }) {
  return <span className={`ui-badge ${className}`}>{children}</span>
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="ui-card flex min-h-56 flex-col items-center justify-center gap-3 p-8 text-center">
      <h2 className="text-xl text-[var(--color-text-primary)]">{title}</h2>
      {description && (
        <p className="max-w-md text-sm text-[var(--color-text-secondary)]">{description}</p>
      )}
      {action}
    </div>
  )
}

export function ModalShell({
  title,
  onClose,
  children,
  className = '',
}: {
  title: string
  onClose: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-text-primary)]/50 p-4"
      role="presentation"
      onClick={onClose}
    >
      <section
        className={`ui-panel max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-xl">{title}</h2>
          <button
            type="button"
            className="ui-button ui-button-ghost h-9 w-9 rounded-full p-0"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

export function StatusBadge({
  status,
  children,
}: {
  status: 'success' | 'error' | 'warning' | 'neutral'
  children: ReactNode
}) {
  const statusClass =
    status === 'success'
      ? 'ui-status-success'
      : status === 'error'
        ? 'ui-status-error'
        : status === 'warning'
          ? 'ui-status-warning'
          : ''
  return <span className={`ui-badge ${statusClass}`}>{children}</span>
}
