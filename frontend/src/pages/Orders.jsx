import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
const Orders = () => {

  const { products, currency } = useContext(ShopContext);
  return (
    <div className='border-t pt-16'>
      <div className='text-2xl'>
        <Title text1="MIS" text2="PEDIDOS" />
      </div>

      <div className='flex flex-col gap-10'>
        {
          products.slice(1, 4).map((item, index) => (
            <div key={index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div className='flex items-start gap-6 text-sm'>
                <img className='w-16 sm:w-20' src={item.image[0]} alt="product" />
                <div>
                  <p className='sm:text-base font-mediumtext-gray-500'>{item.name}</p>
                  <div className='flex items-center gap-3 mt-2 text-base text-gray-700'>
                    <p className='text-lg'>{currency}{item.price}</p>
                    <p className='text-gray-500'>Cantidad: 1</p>
                    <p className='text-gray-500'>Talla: M</p>
                  </div>
                  <p className='mt-2'>Fecha: <span className='font-medium text-gray-400'>{new Date().toLocaleDateString()}</span></p>
                </div>
              </div>
              <div className='md:w-1/2 flex justify-between'>
                <div className='flex items-center gap-2'>
                  <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                  <p className='text-sm md:text-base'>Listo para enviar</p>
                </div>
                <button className='bg-black text-white border font-medium px-4 py-2 text-sm rounded-sm'>Ver pedido</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Orders