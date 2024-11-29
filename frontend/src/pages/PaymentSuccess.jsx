import React, { useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';

const PaymentSuccess = () => {
  const { setCartItems, navigate } = useContext(ShopContext);

  useEffect(() => {
    setCartItems({});
    toast.success('¡Pago realizado con éxito!');
    setTimeout(() => {
      navigate('/orders');
    }, 2000);
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">¡Pago exitoso!</h2>
        <p className="text-gray-600">Redirigiendo a tus órdenes...</p>
      </div>
    </div>
  );
};

export default PaymentSuccess; 