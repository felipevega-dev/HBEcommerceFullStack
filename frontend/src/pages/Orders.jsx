import React, { useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';

const Orders = () => {
  const { orders, currency, token, navigate } = useContext(ShopContext);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Cargar las órdenes cuando el componente se monte
  }, [token, navigate]);

  if (!orders || orders.length === 0) {
    return (
      <div className='border-t pt-16'>
        <div className='text-2xl'>
          <Title text1="MIS" text2="PEDIDOS" />
        </div>
        <p className='text-center text-gray-500 mt-8'>
          {token ? 'No tienes pedidos aún' : 'Cargando pedidos...'}
        </p>
      </div>
    );
  }

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl'>
        <Title text1="MIS" text2="PEDIDOS" />
      </div>

      <div className='flex flex-col gap-10'>
        {orders.map((order, index) => (
          <div key={index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div className='flex items-start gap-6 text-sm'>
              <div>
                <p className='sm:text-base font-medium text-gray-500'>Orden #{order._id}</p>
                <div className='flex items-center gap-3 mt-2 text-base text-gray-700'>
                  <p className='text-lg'>{currency}{order.total}</p>
                  <p className='text-gray-500'>Items: {order.items.length}</p>
                </div>
                <p className='mt-2'>Fecha: <span className='font-medium text-gray-400'>
                  {new Date(order.createdAt).toLocaleDateString()}
                </span></p>
              </div>
            </div>
            <div className='md:w-1/2 flex justify-between'>
              <div className='flex items-center gap-2'>
                <p className={`min-w-2 h-2 rounded-full ${
                  order.status === 'pending' ? 'bg-yellow-500' :
                  order.status === 'processing' ? 'bg-blue-500' :
                  order.status === 'shipped' ? 'bg-green-500' :
                  'bg-gray-500'
                }`}></p>
                <p className='text-sm md:text-base'>{
                  order.status === 'pending' ? 'Pendiente' :
                  order.status === 'processing' ? 'En proceso' :
                  order.status === 'shipped' ? 'Enviado' :
                  'Estado desconocido'
                }</p>
              </div>
              <button 
                onClick={() => navigate(`/order/${order._id}`)}
                className='bg-black text-white border font-medium px-4 py-2 text-sm rounded-sm'
              >
                Ver detalles
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;