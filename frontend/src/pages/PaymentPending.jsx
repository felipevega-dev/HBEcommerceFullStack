import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const PaymentPending = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.info('El pago está pendiente de confirmación');
    setTimeout(() => {
      navigate('/orders');
    }, 2000);
  }, [navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-yellow-600 mb-4">Pago pendiente</h2>
        <p className="text-gray-600">Tu pago está siendo procesado. Redirigiendo a tus órdenes...</p>
      </div>
    </div>
  );
};

export default PaymentPending; 