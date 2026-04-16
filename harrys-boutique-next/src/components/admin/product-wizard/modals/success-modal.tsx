/**
 * Success Modal Component
 * 
 * Displays after successfully saving a product.
 * Shows celebration message and provides options to view the product or create another.
 * 
 * Features:
 * - Celebration animation (scale + fade in)
 * - Auto-close after 10 seconds
 * - Clear draft from localStorage on display
 * - Navigate to product detail or reset wizard
 * 
 * @see requirements.md - Requirement 14: Guardado Final y Confirmación
 * @see design.md - Modals section
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SuccessModalProps {
  /**
   * Whether the modal is visible
   */
  isOpen: boolean;
  
  /**
   * Product ID of the saved product (for navigation)
   */
  productId?: string;
  
  /**
   * Callback when user wants to create another product
   */
  onCreateAnother: () => void;
  
  /**
   * Callback when modal closes
   */
  onClose?: () => void;
}

/**
 * Success Modal
 * 
 * Shows success feedback after saving a product with options to:
 * - View the saved product in admin
 * - Create another product (reset wizard)
 * 
 * Auto-closes after 10 seconds if no action is taken.
 */
export function SuccessModal({
  isOpen,
  productId,
  onCreateAnother,
  onClose,
}: SuccessModalProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  
  /**
   * Auto-close countdown timer
   */
  useEffect(() => {
    if (!isOpen) {
      setCountdown(10);
      return;
    }
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Auto-close and navigate to products list
          handleClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isOpen]);
  
  /**
   * Handle viewing the product
   */
  const handleViewProduct = () => {
    // Redirect to products list since there's no detail page
    router.push('/admin/products');
  };
  
  /**
   * Handle creating another product
   */
  const handleCreateAnother = () => {
    onCreateAnother();
    if (onClose) {
      onClose();
    }
  };
  
  /**
   * Handle modal close (auto-close)
   */
  const handleClose = () => {
    router.push('/admin/products');
    if (onClose) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Modal Container with Animation */}
      <div
        className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-scale-fade-in"
        role="dialog"
        aria-labelledby="success-modal-title"
        aria-describedby="success-modal-description"
      >
        {/* Success Icon and Title */}
        <div className="text-center mb-4">
          <div className="text-5xl mb-3 animate-bounce">✅</div>
          <h2
            id="success-modal-title"
            className="text-xl font-semibold text-gray-900"
          >
            ¡Producto guardado exitosamente!
          </h2>
        </div>
        
        {/* Success Message */}
        <p
          id="success-modal-description"
          className="text-center text-gray-600 mb-6"
        >
          Tu producto ya está disponible en la tienda
        </p>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary Action: View Product */}
          <button
            onClick={handleViewProduct}
            className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            autoFocus
          >
            Ver Producto
          </button>
          
          {/* Secondary Action: Create Another */}
          <button
            onClick={handleCreateAnother}
            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Crear Otro Producto
          </button>
        </div>
        
        {/* Auto-close Countdown */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Cerrando automáticamente en {countdown} segundos...
        </p>
      </div>
      
      {/* CSS Animation Styles */}
      <style jsx>{`
        @keyframes scale-fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-scale-fade-in {
          animation: scale-fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
