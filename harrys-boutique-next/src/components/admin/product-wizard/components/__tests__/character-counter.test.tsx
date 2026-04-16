import { render, screen } from '@testing-library/react'
import { CharacterCounter } from '../character-counter'
import { describe, it, expect } from 'vitest'

describe('CharacterCounter', () => {
  it('renders character count in correct format', () => {
    render(<CharacterCounter current={25} max={100} />)
    expect(screen.getByText('25/100 caracteres')).toBeInTheDocument()
  })

  it('displays normal color when below threshold', () => {
    const { container } = render(<CharacterCounter current={50} max={100} />)
    const counter = container.firstChild as HTMLElement
    expect(counter).toHaveClass('text-gray-400')
    expect(counter).not.toHaveClass('text-amber-600')
    expect(counter).not.toHaveClass('text-red-600')
  })

  it('displays warning color when approaching limit (90% threshold)', () => {
    const { container } = render(<CharacterCounter current={90} max={100} />)
    const counter = container.firstChild as HTMLElement
    expect(counter).toHaveClass('text-amber-600')
    expect(counter).toHaveClass('font-medium')
  })

  it('displays error color when over limit', () => {
    const { container } = render(<CharacterCounter current={105} max={100} />)
    const counter = container.firstChild as HTMLElement
    expect(counter).toHaveClass('text-red-600')
    expect(counter).toHaveClass('font-medium')
  })

  it('shows warning icon when over limit', () => {
    render(<CharacterCounter current={105} max={100} />)
    expect(screen.getByLabelText('Límite excedido')).toBeInTheDocument()
  })

  it('does not show warning icon when within limit', () => {
    render(<CharacterCounter current={50} max={100} />)
    expect(screen.queryByLabelText('Límite excedido')).not.toBeInTheDocument()
  })

  it('uses custom warning threshold', () => {
    const { container } = render(
      <CharacterCounter current={80} max={100} warningThreshold={0.8} />
    )
    const counter = container.firstChild as HTMLElement
    expect(counter).toHaveClass('text-amber-600')
  })

  it('applies custom className', () => {
    const { container } = render(
      <CharacterCounter current={50} max={100} className="custom-class" />
    )
    const counter = container.firstChild as HTMLElement
    expect(counter).toHaveClass('custom-class')
  })

  it('has correct aria-live attribute when normal', () => {
    const { container } = render(<CharacterCounter current={50} max={100} />)
    const counter = container.firstChild as HTMLElement
    expect(counter).toHaveAttribute('aria-live', 'off')
  })

  it('has correct aria-live attribute when approaching limit', () => {
    const { container } = render(<CharacterCounter current={90} max={100} />)
    const counter = container.firstChild as HTMLElement
    expect(counter).toHaveAttribute('aria-live', 'polite')
  })

  it('has correct aria-live attribute when over limit', () => {
    const { container } = render(<CharacterCounter current={105} max={100} />)
    const counter = container.firstChild as HTMLElement
    expect(counter).toHaveAttribute('aria-live', 'assertive')
  })

  it('has role="status" for accessibility', () => {
    const { container } = render(<CharacterCounter current={50} max={100} />)
    const counter = container.firstChild as HTMLElement
    expect(counter).toHaveAttribute('role', 'status')
  })

  it('has descriptive aria-label', () => {
    render(<CharacterCounter current={25} max={100} />)
    expect(screen.getByLabelText('25 de 100 caracteres')).toBeInTheDocument()
  })

  it('handles zero current value', () => {
    render(<CharacterCounter current={0} max={100} />)
    expect(screen.getByText('0/100 caracteres')).toBeInTheDocument()
  })

  it('handles exact limit value', () => {
    const { container } = render(<CharacterCounter current={100} max={100} />)
    const counter = container.firstChild as HTMLElement
    // At exactly 100%, should show warning color (>= 90%)
    expect(counter).toHaveClass('text-amber-600')
    // But not over limit
    expect(screen.queryByLabelText('Límite excedido')).not.toBeInTheDocument()
  })
})
