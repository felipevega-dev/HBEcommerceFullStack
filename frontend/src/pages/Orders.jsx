import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import LoadingSpinner from '../components/LoadingSpinner'

const Orders = () => {
  const { currency, token, navigate, backendUrl } = useContext(ShopContext)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      const storedToken = localStorage.getItem('token')
      
      if (!token && !storedToken) {
        navigate('/login', { state: { from: '/orders' } })
        return
      }

      try {
        const response = await axios.get(`${backendUrl}/api/order/user-orders`, {
          headers: {
            'Authorization': `Bearer ${token || storedToken}`
          }
        })

        if (response.data.success) {
          setOrders(response.data.orders)
        } else {
          toast.error('Error al cargar las órdenes')
        }
      } catch (error) {
        console.error('Error al obtener órdenes:', error)
        if (error.response?.status === 401) {
          navigate('/login', { state: { from: '/orders' } })
        } else {
          toast.error('Error al cargar las órdenes')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [token, navigate, backendUrl])

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'processing': return 'bg-blue-500'
      case 'shipped': return 'bg-green-500'
      case 'delivered': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'processing': return 'En proceso'
      case 'shipped': return 'Enviado'
      case 'delivered': return 'Entregado'
      default: return 'Estado desconocido'
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!orders || orders.length === 0) {
    return (
      <motion.div 
        className='min-h-[60vh] flex flex-col items-center justify-center'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className='text-3xl font-medium mb-4'>Mis Pedidos</h1>
        <p className='text-gray-500 text-center'>
          No tienes pedidos aún. ¡Empieza a comprar!
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className='mt-6 px-6 py-2 bg-black text-white rounded-lg'
          onClick={() => navigate('/collection')}
        >
          Ver productos
        </motion.button>
      </motion.div>
    )
  }

  const OrderDetails = ({ order }) => (
    <motion.div 
      className="mt-4 bg-gray-50 p-6 rounded-lg"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6">
        {/* Items del pedido */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Productos</h3>
          {order.items.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm"
            >
              <img 
                src={item.images?.[0] || item.image?.[0] || assets.default_product} 
                alt={item.name} 
                className="w-16 h-16 object-cover rounded-md"
              />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span>Talla: {item.size}</span>
                  <span>Cantidad: {item.quantity}</span>
                  <span>{currency} {item.price.toLocaleString('es-CL')}</span>
                </div>
              </div>
              <p className="font-medium">
                {currency} {(item.price * item.quantity).toLocaleString('es-CL')}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Resumen de costos */}
        <div className="bg-white p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span>{currency} {(order.amount - 10).toLocaleString('es-CL')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Envío:</span>
            <span>{currency} {(10).toLocaleString('es-CL')}</span>
          </div>
          <div className="flex justify-between font-medium text-lg pt-2 border-t">
            <span>Total:</span>
            <span>{currency} {order.amount.toLocaleString('es-CL')}</span>
          </div>
        </div>

        {/* Información de envío */}
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-medium mb-4">Información de envío</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Nombre:</span>
              <p>{order.address.firstname} {order.address.lastname}</p>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <p>{order.address.email}</p>
            </div>
            <div>
              <span className="text-gray-600">Teléfono:</span>
              <p>{order.address.phone}</p>
            </div>
            <div>
              <span className="text-gray-600">Dirección:</span>
              <p>{order.address.street}</p>
            </div>
            <div>
              <span className="text-gray-600">Ciudad:</span>
              <p>{order.address.city}</p>
            </div>
            <div>
              <span className="text-gray-600">Región:</span>
              <p>{order.address.region}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <motion.div 
      className='container mx-auto py-12'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className='text-3xl font-medium mb-8'>Mis Pedidos</h1>

      <div className='space-y-6'>
        {orders.map((order) => (
          <motion.div 
            key={order._id}
            className='bg-white rounded-lg shadow-sm overflow-hidden'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className='p-6'>
              <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                <div>
                  <p className='text-sm text-gray-500'>Orden #{order._id}</p>
                  <div className='flex items-center gap-4 mt-2'>
                    <p className='text-xl font-medium'>
                      {currency} {order.amount.toLocaleString('es-CL')}
                    </p>
                    <span className='text-sm text-gray-500'>
                      {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                    </span>
                  </div>
                  <p className='text-sm text-gray-500 mt-1'>
                    {new Date(order.date).toLocaleDateString('es-CL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className='flex items-center gap-6'>
                  <div className='flex items-center gap-2'>
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`} />
                    <span className='text-sm'>{getStatusText(order.status)}</span>
                  </div>
                  
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-gray-500'>{order.paymentMethod}</span>
                    <span className={`text-sm ${order.payment ? 'text-green-500' : 'text-yellow-500'}`}>
                      {order.payment ? 'Pagado' : 'Pendiente'}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                    className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                  >
                    <img 
                      src={assets.dropdown_icon2}
                      alt="Toggle details"
                      className={`w-5 h-5 transition-transform duration-300 ${
                        expandedOrder === order._id ? 'rotate-180' : ''
                      }`}
                    />
                  </motion.button>
                </div>
              </div>

              <AnimatePresence>
                {expandedOrder === order._id && <OrderDetails order={order} />}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default Orders