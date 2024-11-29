import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    const tempData = [];
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          tempData.push({
            _id: items, 
            size: item, 
            quantity: cartItems[items][item]
          });
        }
      }
    }
    setCartData(tempData);
  }, [cartItems]);

  if (cartData.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center border-t pt-14 min-h-[60vh]'>
        <div className='text-2xl mb-8'>
          <Title text1='CARRITO' text2='DE COMPRAS' />
        </div>
        <div className='flex flex-col items-center gap-6'>
          <img src={assets.carritofb} alt="Carrito vacío" className='w-24 opacity-50' />
          <h2 className='text-xl font-medium text-gray-600'>Tu Carrito está vacío</h2>
          <p className='text-gray-500 text-center max-w-md'>
            ¡Aprovecha! Tenemos miles de productos en oferta y oportunidades únicas.
          </p>
          <button 
            onClick={() => navigate('/')} 
            className='bg-black text-white px-8 py-3 mt-4 hover:bg-gray-800 transition-colors'
          >
            Ver ofertas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col border-t pt-14'>
      <div className='text-2xl mb-3'>
        <Title text1='CARRITO' text2='DE COMPRAS' />
      </div>

      <div className='flex flex-col gap-4'>
        {cartData.map((item, index) => {
          const productData = products.find((product) => product._id === item._id);
          if (!productData) return null;

          const productImage = productData.images?.[0] || productData.image?.[0] || assets.default_product;

          return (
            <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
              <div className='flex items-start gap-4'>
                <img className='w-16 sm:w-20' src={productImage} alt={productData.name} />
                <div className='flex flex-col gap-1'>
                  <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>
                  <div className='flex items-center gap-5 mt-2'>
                    <p>{currency} {productData.price}</p>
                    <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50 rounded-md'>{item.size}</p>
                  </div>
                </div>
              </div>
              <input 
                onChange={(e) => {
                  const value = e.target.value;
                  if (value !== '' && value !== '0') {
                    updateQuantity(item._id, item.size, Number(value));
                  }
                }} 
                type="number" 
                min="1" 
                defaultValue={item.quantity} 
                className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1' 
              />
              <img 
                onClick={() => updateQuantity(item._id, item.size, 0)} 
                src={assets.bin_icon} 
                alt="trash" 
                className='w-4 mr-4 sm:w-5 cursor-pointer' 
              />
            </div>
          )
        })}
      </div>
      
      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
          <CartTotal />
          <div className='w-full text-end'>
            <button 
              onClick={() => navigate('/place-order')} 
              className='bg-black text-white text-sm my-8 px-8 py-3'
            >
              Continuar Compra
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart