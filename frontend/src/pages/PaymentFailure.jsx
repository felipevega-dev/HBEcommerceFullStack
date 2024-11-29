import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const PaymentFailure = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.error('El pago no pudo ser procesado');
    setTimeout(() => {
      navigate('/cart');
    }, 2000);
  }, [navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error en el pago</h2>
        <p className="text-gray-600">Hubo un problema al procesar tu pago. Redirigiendo al carrito...</p>
      </div>
    </div>
  );
};

export default PaymentFailure; 