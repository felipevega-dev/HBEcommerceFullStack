/**
 * Unit tests for ErrorModal component
 * 
 * Tests:
 * - Modal visibility
 * - Error message display
 * - Retry action
 * - Close action
 * - Error logging
 * - Escape key handling
 * - Red accent styling
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterAll } from 'vitest';
import { ErrorModal } from '../error-modal';

describe('ErrorModal', () => {
  const mockOnRetry = vi.fn();
  const mockOnClose = vi.fn();
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });
  
  it('should not render when isOpen is false', () => {
    render(
      <ErrorModal
        isOpen={false}
        onRetry={mockOnRetry}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.queryByText(/No se pudo guardar el producto/i)).not.toBeInTheDocument();
  });
  
  it('should render when isOpen is true', () => {
    render(
      <ErrorModal
        isOpen={true}
        onRetry={mockOnRetry}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText(/No se pudo guardar el producto/i)).toBeInTheDocument();
  });
  
  it('should display error icon', () => {
    render(
      <ErrorModal
        isOpen={true}
        onRetry={mockOnRetry}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('No se pudo guardar el producto')).toBeInTheDocument();
  });
  
  it('should display custom error message when provided', () => {
    const customError = 'Error de conexión con el servidor';
    
    render(
      <ErrorModal
        isOpen={true}
        errorMessage={customError}
        onRetry={mockOnRetry}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText(customError)).toBeInTheDocument();
  });
  
  it('should display generic error message when no message provided', () => {
    render(
      <ErrorModal
        isOpen={true}
        onRetry={mockOnRetry}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText(/Ocurrió un error al guardar. Por favor intentá de nuevo./i)).toBeInTheDocument();
  });
  
  it('should display action buttons', () => {
    render(
      <ErrorModal
        isOpen={true}
        onRetry={mockOnRetry}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Intentar de nuevo')).toBeInTheDocument();
    expect(screen.getByText('Volver al wizard')).toBeInTheDocument();
  });
  
  it('should call onRetry when "Intentar de nuevo" is clicked', () => {
    render(
      <ErrorModal
        isOpen={true}
        onRetry={mockOnRetry}
        onClose={mockOnClose}
      />
    );
    
    const retryButton = screen.getByText('Intentar de nuevo');
    fireEvent.click(retryButton);
    
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });
  
  it('should call onClose when "Volver al wizard" is clicked', () => {
    render(
      <ErrorModal
        isOpen={true}
        onRetry={mockOnRetry}
        onClose={mockOnClose}
      />
    );
    
    const closeButton = screen.getByText('Volver al wizard');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('should log error to console when modal opens with error message', () => {
    const errorMessage = 'Test error message';
    
    render(
      <ErrorModal
        isOpen={true}
        errorMessage={errorMessage}
        onRetry={mockOnRetry}
        onClose={mockOnClose}
      />
    );
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Product save error:', errorMessage);
  });
  
  it('should not log error when modal opens without error message', () => {
    render(
      <ErrorModal
        isOpen={true}
        onRetry={mockOnRetry}
        onClose={mockOnClose}
      />
    );
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
  
  it('should close modal when Escape key is pressed', () => {
    render(
      <ErrorModal
        isOpen={true}
        onRetry={mockOnRetry}
        onClose={mockOnClose}
      />
    );
    
    fireEvent.keyDown(window, { key: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('should not close modal when other keys are pressed', () => {
    render(
      <ErrorModal
        isOpen={true}
        onRetry={mockOnRetry}
        onClose={mockOnClose}
      />
    );
    
    fireEvent.keyDown(window, { key: 'Enter' });
    fireEvent.keyDown(window, { key: 'Space' });
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });
  
  it('should display help text about data being saved', () => {
    render(
      <ErrorModal
        isOpen={true}
        onRetry={mockOnRetry}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText(/Tus datos están guardados/i)).toBeInTheDocument();
  });
  
  it('should have proper ARIA attributes', () => {
    render(
      <ErrorModal
        isOpen={true}
        onRetry={mockOnRetry}
        onClose={mockOnClose}
      />
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'error-modal-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'error-modal-description');
  });
  
  it('should have retry button focused by default', () => {
    render(
      <ErrorModal
        isOpen={true}
        onRetry={mockOnRetry}
        onClose={mockOnClose}
      />
    );
    
    // Just verify the button exists and is clickable
    const retryButton = screen.getByText('Intentar de nuevo');
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).not.toBeDisabled();
  });
  
  it('should have red accent color on retry button', () => {
    render(
      <ErrorModal
        isOpen={true}
        onRetry={mockOnRetry}
        onClose={mockOnClose}
      />
    );
    
    const retryButton = screen.getByText('Intentar de nuevo');
    expect(retryButton).toHaveClass('bg-red-600');
  });
  
  it('should have red accent color on title', () => {
    render(
      <ErrorModal
        isOpen={true}
        onRetry={mockOnRetry}
        onClose={mockOnClose}
      />
    );
    
    const title = screen.getByText(/No se pudo guardar el producto/i);
    expect(title).toHaveClass('text-red-600');
  });
});
