import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets'

const Orders = ({token}) => {
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAllOrders = async () => {
    if (!token) return null;

    try {
      const response = await axios.get(`${backendUrl}/api/order/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

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
                <p>${item.price}</p>
              </div>
            </div>
            <p className="font-medium">${item.price * item.quantity}</p>
          </div>
        ))}
        
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between text-sm">
            <p className="text-gray-600">Subtotal:</p>
            <p>${order.amount - 10}</p>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <p className="text-gray-600">Envío:</p>
            <p>$10</p>
          </div>
          <div className="flex justify-between font-medium mt-2">
            <p>Total:</p>
            <p>${order.amount}</p>
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

        <div className="border-t pt-3">
          <h4 className="font-medium text-gray-700 mb-2">Acciones</h4>
          <div className="flex gap-2">
            <select 
              className="px-3 py-2 border rounded-md"
              value={order.status}
              onChange={(e) => handleStatusChange(order._id, e.target.value)}
            >
              <option value="pending">Pendiente</option>
              <option value="processing">En proceso</option>
              <option value="shipped">Enviado</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const handleStatusChange = async (orderId, newStatus) => {
    // TODO: Implement status change functionality
    toast.info('Función de cambio de estado en desarrollo');
  };

  if (loading) {
    return (
      <div className="p-6">
        <h3 className="text-2xl font-semibold mb-6">Órdenes</h3>
        <p className="text-center text-gray-500">Cargando órdenes...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-2xl font-semibold mb-6">Órdenes</h3>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="border rounded-lg p-4 bg-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Orden #{order._id}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`}></span>
                  <span className="text-sm">{getStatusText(order.status)}</span>
                </div>
                <button 
                  onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <img 
                    src={assets.dropdown_icon} 
                    alt="Expandir"
                    className={`w-5 h-5 transition-transform ${expandedOrder === order._id ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
            </div>
            
            {expandedOrder === order._id && <OrderDetails order={order} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;