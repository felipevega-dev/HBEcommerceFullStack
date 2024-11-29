import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
  const [method, setMethod] = useState('cod');
  const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);

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

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setFormData({...formData, [name]: value});
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      console.log('Token being sent:', token);
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

      console.log('Order data being sent:', orderData);

      switch (method) {
        case 'cod':
          const response = await axios.post(`${backendUrl}/api/order/place`, orderData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }).catch(error => {
            console.log('Error response:', error.response?.data);
            console.log('Error status:', error.response?.status);
            console.log('Error headers:', error.response?.headers);
            throw error;
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
      console.error('Error completo al crear la orden:', error);
      toast.error(error.response?.data?.message || 'Error al crear la orden');
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
      {/* Left Side */}
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
      

        <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'INFORMACIÓN DEL'} text2='ENVÍO' />
        </div>
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
              <img className='h-5 mx-4' src={assets.mercadopago_logo} alt="card" />
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
        </div>
        <div className='w-full text-end mt-8'>
          <button type="submit" className='bg-black text-white px-16 py-3 text-sm'>
            HACER PEDIDO
          </button>
        </div>

      </div>
    </form>
  )
}

export default PlaceOrder