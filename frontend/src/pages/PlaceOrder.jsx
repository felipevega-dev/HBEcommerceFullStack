import React, { useContext, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import LoadingSpinner from '../components/LoadingSpinner'

const PlaceOrder = () => {
  const [method, setMethod] = useState('cod');
  const [isLoading, setIsLoading] = useState(false);
  const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [preferenceId, setPreferenceId] = useState(null);

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    street: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    phone: ''
  });

  // Cargar direcciones guardadas del usuario
  useEffect(() => {
    const fetchUserAddresses = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success && response.data.user.billingAddresses) {
          setSavedAddresses(response.data.user.billingAddresses);
          
          // Buscar la dirección predeterminada
          const defaultAddress = response.data.user.billingAddresses.find(addr => addr.isDefault);
          
          // Si existe una dirección predeterminada, usarla automáticamente
          if (defaultAddress) {
            setFormData({
              firstname: defaultAddress.firstname || '',
              lastname: defaultAddress.lastname || '',
              email: response.data.user.email || '',
              street: defaultAddress.street || '',
              city: defaultAddress.city || '',
              region: defaultAddress.region || '',
              postalCode: defaultAddress.postalCode || '',
              country: defaultAddress.country || '',
              phone: defaultAddress.phone || ''
            });
          }
        }
      } catch (error) {
        console.error('Error al cargar direcciones:', error);
      }
    };

    if (token) {
      fetchUserAddresses();
    }
  }, [token, backendUrl]);

  useEffect(() => {
    initMercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY);
  }, []);

  const handleUseSavedAddress = (address) => {
    setFormData({
      firstname: address.firstname || '',
      lastname: address.lastname || '',
      email: address.email || '',
      street: address.street || '',
      city: address.city || '',
      region: address.region || '',
      postalCode: address.postalCode || '',
      country: address.country || '',
      phone: address.phone || ''
    });
  };

  const getAddressPreview = (address) => {
    return `${address.street}, ${address.city}`;
  };

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData({...formData, [name]: value});
  }

  const createPreference = async () => {
    try {
      setIsLoading(true);
      let orderItems = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(products.find(product => product._id === items));
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const data = {
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
        address: formData
      };

      const response = await axios.post(
        `${backendUrl}/api/mercadopago/create-preference`,
        data,
        config
      );

      if (response.data.success) {
        setPreferenceId(response.data.preferenceId);
      } else {
        toast.error('Error al crear la preferencia de pago');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!formData.firstname || !formData.email || !formData.street) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    if (method === 'mercadopago') {
      await createPreference();
    } else {
      try {
        let orderItems = []

        for (const items in cartItems) {
          for (const item in cartItems[items]) {
            if (cartItems[items][item] > 0) {
              const itemInfo = structuredClone(products.find(product => product._id === items));
              if (itemInfo) {
                itemInfo.size = item;
                itemInfo.quantity = cartItems[items][item];
                orderItems.push(itemInfo);
              }
            }
          }
        }
        
        let orderData = {
          address: formData,
          items: orderItems,
          amount: getCartAmount() + delivery_fee,
        }

        // Guardar nueva dirección si no existe ya
        if (savedAddresses.length < 2) {
          const addressExists = savedAddresses.some(addr => 
            addr.street === formData.street && 
            addr.city === formData.city
          );

          if (!addressExists) {
            try {
              await axios.put(
                `${backendUrl}/api/user/profile`,
                {
                  billingAddresses: [...savedAddresses, formData]
                },
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              );
              toast.success('Nueva dirección guardada');
            } catch (error) {
              console.error('Error al guardar nueva dirección:', error);
            }
          }
        }

        // Proceder con la orden según el método de pago
        switch (method) {
          case 'cod':
            const response = await axios.post(`${backendUrl}/api/order/place`, orderData, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.data.success) {
              setCartItems({});
              toast.success('Orden creada exitosamente');
              navigate('/orders');
            } else {
              toast.error(response.data.message);
            }
            break;
          default:
            break;
        }

      } catch (error) {
        console.error('Error al crear la orden:', error);
        toast.error(error.response?.data?.message || 'Error al crear la orden');
      }
    }
  }

  return (
    <motion.form 
      onSubmit={onSubmitHandler} 
      className='flex flex-col lg:flex-row gap-8 py-8'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Información de envío */}
      <div className='flex-1 space-y-8'>
        <h2 className='text-2xl font-medium'>Información de Envío</h2>

        {/* Direcciones guardadas */}
        <AnimatePresence>
          {savedAddresses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {savedAddresses.map((address, index) => (
                <motion.button
                  key={index}
                  type="button"
                  onClick={() => handleUseSavedAddress(address)}
                  className={`w-full p-4 text-left border rounded-lg transition-all ${
                    address.isDefault ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div>
                    <p className="font-medium text-sm">
                      Utilizar dirección: {getAddressPreview(address)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {address.firstname} {address.lastname}
                    </p>
                  </div>
                  {address.isDefault && (
                    <span className="text-xs bg-black text-white px-2 py-1 rounded">
                      Predeterminada
                    </span>
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulario de dirección */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <input required onChange={onChangeHandler} name='firstname' value={formData.firstname} className='border border-gray-300 rounded px-3.5 py-1.5 w-full' type="text" placeholder='Nombre' />
          <input required onChange={onChangeHandler} name='lastname' value={formData.lastname} className='border border-gray-300 rounded px-3.5 py-1.5 w-full' type="text" placeholder='Apellido' />
          <input required onChange={onChangeHandler} name='email' value={formData.email} className='border border-gray-300 rounded px-3.5 py-1.5 w-full' type="email" placeholder='Correo Electrónico' />
          <input required onChange={onChangeHandler} name='street' value={formData.street} className='border border-gray-300 rounded px-3.5 py-1.5 w-full' type="text" placeholder='Dirección' />
          <div className='flex gap-3'>
            <input required onChange={onChangeHandler} name='city' value={formData.city} className='border border-gray-300 rounded px-3.5 py-1.5 w-full' type="text" placeholder='Ciudad' />
            <input required onChange={onChangeHandler} name='region' value={formData.region} className='border border-gray-300 rounded px-3.5 py-1.5 w-full' type="text" placeholder='Región' />
          </div>
          <div className='flex gap-3'>
            <input required onChange={onChangeHandler} name='postalCode' value={formData.postalCode} className='border border-gray-300 rounded px-3.5 py-1.5 w-full' type="number" placeholder='Código Postal' />
            <input required onChange={onChangeHandler} name='country' value={formData.country} className='border border-gray-300 rounded px-3.5 py-1.5 w-full' type="text" placeholder='País' />
          </div>
          <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='border border-gray-300 rounded px-3.5 py-1.5 w-full' type="number" placeholder='Teléfono' />
        </div>
      </div>

      {/* Resumen y método de pago */}
      <div className='lg:w-[400px] space-y-8'>
        <CartTotal />
        
        <div className='space-y-4'>
          <h3 className='text-lg font-medium'>Método de Pago</h3>
          <div className='space-y-2'>
            {[
              { id: 'mercadopago', logo: assets.mercadopago_logo, label: 'MercadoPago' },
              { id: 'cod', logo: null, label: 'Pago contra entrega' }
            ].map((paymentMethod) => (
              <motion.button
                key={paymentMethod.id}
                type="button"
                onClick={() => setMethod(paymentMethod.id)}
                className={`w-full p-4 border rounded-lg flex items-center gap-4 transition-all ${
                  method === paymentMethod.id ? 'border-black bg-gray-50' : 'border-gray-200'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {paymentMethod.logo && (
                  <img src={paymentMethod.logo} alt={paymentMethod.label} className="h-6" />
                )}
                <span className="text-sm">{paymentMethod.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Botones de acción */}
        {method === 'mercadopago' ? (
          <>
            {!preferenceId ? (
              <motion.button
                type="submit"
                className='w-full py-3 bg-black text-white rounded-lg font-medium'
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={isLoading}
              >
                {isLoading ? 'Procesando...' : 'Continuar con MercadoPago'}
              </motion.button>
            ) : (
              <div className="mt-4">
                <Wallet initialization={{ preferenceId }} />
              </div>
            )}
          </>
        ) : (
          <motion.button
            type="submit"
            className='w-full py-3 bg-black text-white rounded-lg font-medium'
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : 'Confirmar Pedido'}
          </motion.button>
        )}
      </div>
    </motion.form>
  )
}

export default PlaceOrder