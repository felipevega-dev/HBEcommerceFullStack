import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { Tooltip } from '../tooltip'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('renders info icon button', () => {
    render(<Tooltip content="Test tooltip content" />)
    const button = screen.getByRole('button', { name: /más información/i })
    expect(button).toBeInTheDocument()
  })

  it('shows tooltip on hover', () => {
    render(<Tooltip content="Test tooltip content" />)
    
    const button = screen.getByRole('button', { name: /más información/i })
    fireEvent.mouseEnter(button)
    
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toBeInTheDocument()
    expect(tooltip).toHaveTextContent('Test tooltip content')
  })

  it('hides tooltip on mouse leave', () => {
    render(<Tooltip content="Test tooltip content" />)
    
    const button = screen.getByRole('button', { name: /más información/i })
    fireEvent.mouseEnter(button)
    
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    
    fireEvent.mouseLeave(button)
    
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('auto-hides tooltip after 5 seconds', () => {
    render(<Tooltip content="Test tooltip content" />)
    
    const button = screen.getByRole('button', { name: /más información/i })
    fireEvent.mouseEnter(button)
    
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    
    // Fast-forward 5 seconds - wrapped in act to handle state updates
    act(() => {
      vi.runAllTimers()
    })
    
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('uses custom aria-label when provided', () => {
    render(<Tooltip content="Test content" ariaLabel="Custom label" />)
    const button = screen.getByRole('button', { name: 'Custom label' })
    expect(button).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <Tooltip content="Test content" className="custom-class" />
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('custom-class')
  })

  it('shows tooltip on focus', () => {
    render(<Tooltip content="Test tooltip content" />)
    
    const button = screen.getByRole('button', { name: /más información/i })
    fireEvent.focus(button)
    
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('hides tooltip on blur', () => {
    render(
      <>
        <Tooltip content="Test tooltip content" />
        <button>Other button</button>
      </>
    )
    
    const tooltipButton = screen.getByRole('button', { name: /más información/i })
    fireEvent.focus(tooltipButton)
    
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    
    fireEvent.blur(tooltipButton)
    
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
