import React, { useContext, useState, useEffect } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

const PlaceOrder = () => {
  const [method, setMethod] = useState('cod');
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

      // Asegurarnos de que el token esté incluido en los headers
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
        console.error('Error en la respuesta:', response.data);
        toast.error('Error al crear la preferencia de pago');
      }
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Error response:', error.response);
      toast.error('Error al procesar el pago');
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
    <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
      {/* Left Side */}
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
        <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'INFORMACIÓN DEL'} text2='ENVÍO' />
        </div>

        {/* Direcciones guardadas */}
        {savedAddresses.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Direcciones guardadas:</p>
            <div className="flex flex-col gap-2">
              {savedAddresses.map((address, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleUseSavedAddress(address)}
                  className={`flex justify-between items-center w-full px-4 py-3 text-left border ${
                    address.isDefault ? 'border-black' : 'border-gray-300'
                  } rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black`}
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
                </button>
              ))}
            </div>
          </div>
        )}

        <div className='flex gap-3'>
          <input required onChange={onChangeHandler} name='firstname' value={formData.firstname} className='border border-gray-300 rounded px-3.5 py-1.5 w-full' type="text" placeholder='Nombre' />
          <input required onChange={onChangeHandler} name='lastname' value={formData.lastname} className='border border-gray-300 rounded px-3.5 py-1.5 w-full' type="text" placeholder='Apellido' />
        </div>
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

      {/* Right Side */}
      <div className='mt-8'>
        <div className='mt-8 min-w-[450px]'>
          <CartTotal />
        </div>
        {/* Payment Method */}
        <div className='mt-12'>
          <Title text1={'METODO DE'} text2='PAGO' />
          <div className='flex gap-3 flex-col lg:flex-row'>
            <div onClick={() => setMethod('mercadopago')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'mercadopago' ? 'bg-green-400' : ''}`}></p>
              <img className='h-5 mx-4' src={assets.mercadopago_logo} alt="MercadoPago" />
            </div>
            <div onClick={() => setMethod('paypal')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'paypal' ? 'bg-green-400' : ''}`}></p>
              <img className='h-5 mx-4' src={assets.paypal_logo} alt="card" />
            </div>
            <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
              <p className='text-gray-500 text-sm font-medium mx-4'>POR PAGAR A DOMICILIO</p>
            </div>
          </div>

          {/* Contenedor para el botón de MercadoPago */}
          {method === 'mercadopago' && !preferenceId && (
            <div className='w-full text-end mt-8'>
              <button 
                type="submit" 
                className='bg-black text-white px-16 py-3 text-sm'
              >
                Continuar con MercadoPago
              </button>
            </div>
          )}

          {/* Contenedor para el Wallet de MercadoPago */}
          {method === 'mercadopago' && preferenceId && (
            <div className="mt-8">
              <Wallet
                initialization={{ preferenceId }}
                customization={{ texts: { valueProp: 'smart_option' } }}
              />
            </div>
          )}

          {/* Botón de hacer pedido (solo visible para otros métodos) */}
          {method !== 'mercadopago' && (
            <div className='w-full text-end mt-8'>
              <button 
                type="submit" 
                className='bg-black text-white px-16 py-3 text-sm'
              >
                HACER PEDIDO
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder