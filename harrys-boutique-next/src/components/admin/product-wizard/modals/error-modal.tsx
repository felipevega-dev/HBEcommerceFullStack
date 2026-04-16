/**
 * Error Modal Component
 * 
 * Displays when a product save operation fails.
 * Shows error message and provides options to retry or return to wizard.
 * 
 * Features:
 * - Display API error message or generic fallback
 * - Retry save operation
 * - Return to wizard without losing data
 * - Red accent color for error state
 * - Log error to console for debugging
 * 
 * @see requirements.md - Requirement 14: Guardado Final y Confirmación
 * @see design.md - Modals section
 */

'use client';

import { useEffect } from 'react';

interface ErrorModalProps {
  /**
   * Whether the modal is visible
   */
  isOpen: boolean;
  
  /**
   * Error message from API or generic message
   */
  errorMessage?: string;
  
  /**
   * Callback when user wants to retry the save operation
   */
  onRetry: () => void;
  
  /**
   * Callback when user wants to return to wizard
   */
  onClose: () => void;
}

/**
 * Error Modal
 * 
 * Shows error feedback when product save fails with options to:
 * - Retry the save operation
 * - Return to wizard and stay on review step
 * 
 * All product data is kept intact for retry.
 */
export function ErrorModal({
  isOpen,
  errorMessage,
  onRetry,
  onClose,
}: ErrorModalProps) {
  /**
   * Log error to console for debugging
   */
  useEffect(() => {
    if (isOpen && errorMessage) {
      console.error('Product save error:', errorMessage);
    }
  }, [isOpen, errorMessage]);
  
  /**
   * Handle escape key to close modal
   */
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  // Default error message if none provided
  const displayMessage = errorMessage || 
    'Ocurrió un error al guardar. Por favor intentá de nuevo.';
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Modal Container */}
      <div
        className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-fade-in"
        role="dialog"
        aria-labelledby="error-modal-title"
        aria-describedby="error-modal-description"
      >
        {/* Error Icon and Title */}
        <div className="text-center mb-4">
          <div className="text-5xl mb-3">❌</div>
          <h2
            id="error-modal-title"
            className="text-xl font-semibold text-red-600"
          >
            No se pudo guardar el producto
          </h2>
        </div>
        
        {/* Error Message */}
        <div className="mb-6">
          <p
            id="error-modal-description"
            className="text-center text-gray-600"
          >
            {displayMessage}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary Action: Retry */}
          <button
            onClick={onRetry}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
            autoFocus
          >
            Intentar de nuevo
          </button>
          
          {/* Secondary Action: Return to Wizard */}
          <button
            onClick={onClose}
            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Volver al wizard
          </button>
        </div>
        
        {/* Help Text */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Tus datos están guardados. Podés intentar de nuevo cuando quieras.
        </p>
      </div>
      
      {/* CSS Animation Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
