import Link from 'next/link'
import { forwardRef } from 'react'

const variantClasses = {
  primary:
    'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] border border-transparent',
  secondary:
    'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dark)] border border-transparent',
  outline:
    'border border-[var(--color-border-strong)] bg-transparent text-[var(--color-text-primary)] hover:border-[var(--color-accent-dark)] hover:bg-[var(--color-surface)]',
  ghost:
    'border border-transparent bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]',
  link: 'border border-transparent bg-transparent p-0 text-[var(--color-text-primary)] underline-offset-4 hover:underline',
} as const

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
} as const

type ButtonVariant = keyof typeof variantClasses
type ButtonSize = keyof typeof sizeClasses

type BaseProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: React.ReactNode
}

type ButtonAsButton = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined
  }

type ButtonAsLink = BaseProps &
  Omit<React.ComponentPropsWithoutRef<typeof Link>, 'className'> & {
    href: string
  }

export type ButtonProps = ButtonAsButton | ButtonAsLink

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button({ variant = 'primary', size = 'md', className, children, ...props }, ref) {
    const base = cn(
      'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200',
      'rounded-[var(--radius-md)] disabled:pointer-events-none disabled:opacity-50',
      variant !== 'link' && sizeClasses[size],
      variantClasses[variant],
      className,
    )

    if ('href' in props && props.href) {
      const { href, ...linkProps } = props as ButtonAsLink
      return (
        <Link ref={ref as React.Ref<HTMLAnchorElement>} href={href} className={base} {...linkProps}>
          {children}
        </Link>
      )
    }

    const buttonProps = props as ButtonAsButton
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} className={base} {...buttonProps}>
        {children}
      </button>
    )
  },
)
