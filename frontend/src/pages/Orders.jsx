import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const Orders = () => {
  const { currency, token, navigate, backendUrl } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

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

  const OrderDetails = ({ order }) => (
    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
      <h3 className="font-medium text-gray-700 mb-3">Detalles del pedido</h3>
      <div className="space-y-4">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-md">
            <img 
              src={item.images?.[0] || item.image?.[0] || assets.default_product} 
              alt={item.name} 
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <p>Talla: {item.size}</p>
                <p>Cantidad: {item.quantity}</p>
                <p>{currency}{item.price}</p>
              </div>
            </div>
            <p className="font-medium">{currency}{item.price * item.quantity}</p>
          </div>
        ))}
        
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between text-sm">
            <p className="text-gray-600">Subtotal:</p>
            <p>{currency}{order.amount - 10}</p>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <p className="text-gray-600">Envío:</p>
            <p>{currency}10</p>
          </div>
          <div className="flex justify-between font-medium mt-2">
            <p>Total:</p>
            <p>{currency}{order.amount}</p>
          </div>
        </div>

        <div className="border-t pt-3">
          <h4 className="font-medium text-gray-700 mb-2">Información de envío</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="text-gray-600">Nombre:</span> {order.address.firstname} {order.address.lastname}</p>
            <p><span className="text-gray-600">Email:</span> {order.address.email}</p>
            <p><span className="text-gray-600">Teléfono:</span> {order.address.phone}</p>
            <p><span className="text-gray-600">Dirección:</span> {order.address.street}</p>
            <p><span className="text-gray-600">Ciudad:</span> {order.address.city}</p>
            <p><span className="text-gray-600">Región:</span> {order.address.region}</p>
            <p><span className="text-gray-600">Código Postal:</span> {order.address.postalCode}</p>
            <p><span className="text-gray-600">País:</span> {order.address.country}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl'>
        <Title text1="MIS" text2="PEDIDOS" />
      </div>

      <div className='flex flex-col gap-10 mt-8'>
        {orders.map((order) => (
          <div key={order._id} className='py-4 border-t border-b'>
            <div className='text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
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
                </div>
              </div>
              <div className='md:w-1/2 flex justify-between items-center'>
                <div className='flex items-center gap-2'>
                  <p className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`}></p>
                  <p className='text-sm md:text-base'>{getStatusText(order.status)}</p>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm text-gray-500'>{order.paymentMethod}</p>
                    <p className={`text-sm ${order.payment ? 'text-green-500' : 'text-yellow-500'}`}>
                      {order.payment ? 'Pagado' : 'Pendiente'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <img 
                      src={assets.dropdown_icon2} 
                      alt="Expandir"
                      className={`w-5 h-5 transition-transform ${expandedOrder === order._id ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Detalles expandibles */}
            {expandedOrder === order._id && <OrderDetails order={order} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;