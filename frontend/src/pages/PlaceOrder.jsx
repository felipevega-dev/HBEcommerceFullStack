import React, { useState, useContext } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  const [method, setMethod] = useState('cod');

  const { navigate } = useContext(ShopContext);

  return (
    <div className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
      {/* Left Side */}
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
      

        <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'INFORMACIÓN DEL'} text2='ENVÍO' />
        </div>
        <div className='flex gap-3'>
          <input className='border border-gray-300 rounded px-3.5 py-1.5 w-full' type="text" placeholder='Nombre' />
          <input className='border border-gray-300 rounded px-3.5 py-1.5 w-full' type="text" placeholder='Apellido' />
        </div>
        <input className='border border-gray-300 rounded px-3.5 py-1.5 w-full' type="email" placeholder='Correo Electrónico' />
        <input className='border border-gray-300 rounded px-3.5 py-1.5 w-full' type="text" placeholder='Dirección' />
        <div className='flex gap-3'>
          <input className='border border-gray-300 rounded px-3.5 py-1.5 w-full' type="text" placeholder='Ciudad' />
          <input className='border border-gray-300 rounded px-3.5 py-1.5 w-full' type="text" placeholder='Región' />
        </div>
        <div className='flex gap-3'>
          <input className='border border-gray-300 rounded px-3.5 py-1.5 w-full' type="number" placeholder='Código Postal' />
          <input className='border border-gray-300 rounded px-3.5 py-1.5 w-full' type="text" placeholder='País' />
        </div>
        <input className='border border-gray-300 rounded px-3.5 py-1.5 w-full' type="number" placeholder='Teléfono' />
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
          <button onClick={() => navigate('/orders')} className='bg-black text-white px-16 py-3 text-sm'>
            HACER PEDIDO
          </button>
        </div>

      </div>
    </div>
  )
}

export default PlaceOrder