import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';

const Orders = () => {
  const { currency, token, navigate, backendUrl } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`${backendUrl}/api/order/user-orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setOrders(response.data.orders);
        } else {
          toast.error('Error al cargar las órdenes');
        }
      } catch (error) {
        console.error('Error al obtener órdenes:', error);
        toast.error('Error al cargar las órdenes');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, navigate, backendUrl]);

  if (loading) {
    return (
      <div className='border-t pt-16'>
        <div className='text-2xl'>
          <Title text1="MIS" text2="PEDIDOS" />
        </div>
        <p className='text-center text-gray-500 mt-8'>Cargando pedidos...</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className='border-t pt-16'>
        <div className='text-2xl'>
          <Title text1="MIS" text2="PEDIDOS" />
        </div>
        <p className='text-center text-gray-500 mt-8'>No tienes pedidos aún</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'En proceso';
      case 'shipped': return 'Enviado';
      default: return 'Estado desconocido';
    }
  };

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl'>
        <Title text1="MIS" text2="PEDIDOS" />
      </div>

      <div className='flex flex-col gap-10 mt-8'>
        {orders.map((order) => (
          <div key={order._id} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div className='flex items-start gap-6 text-sm'>
              <div>
                <p className='sm:text-base font-medium text-gray-500'>Orden #{order._id}</p>
                <div className='flex items-center gap-3 mt-2 text-base text-gray-700'>
                  <p className='text-lg'>{currency}{order.amount}</p>
                  <p className='text-gray-500'>Items: {order.items.length}</p>
                </div>
                <p className='mt-2'>Fecha: <span className='font-medium text-gray-400'>
                  {new Date(order.date).toLocaleDateString()}
                </span></p>
                <p className='mt-1'>Envío a: <span className='font-medium text-gray-400'>
                  {order.address.street}, {order.address.city}
                </span></p>
              </div>
            </div>
            <div className='md:w-1/2 flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <p className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`}></p>
                <p className='text-sm md:text-base'>{getStatusText(order.status)}</p>
              </div>
              <div className='flex items-center gap-2'>
                <p className='text-sm text-gray-500'>{order.paymentMethod}</p>
                <p className={`text-sm ${order.payment ? 'text-green-500' : 'text-yellow-500'}`}>
                  {order.payment ? 'Pagado' : 'Pendiente'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;