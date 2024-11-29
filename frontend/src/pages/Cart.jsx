import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';
import RelatedProducts from '../components/RelatedProducts';

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

  // Calcular ahorro total
  const calculateSavings = () => {
    let totalSavings = 0;
    cartData.forEach(item => {
      const productData = products.find(product => product._id === item._id);
      if (productData?.originalPrice && productData.originalPrice > productData.price) {
        totalSavings += (productData.originalPrice - productData.price) * item.quantity;
      }
    });
    return totalSavings;
  };

  // Obtener categorías únicas de los productos en el carrito
  const getCartCategories = () => {
    const categories = cartData.map(item => {
      const product = products.find(p => p._id === item._id);
      return {
        category: product?.category,
        subCategory: product?.subCategory
      };
    }).filter(Boolean);

    // Eliminar duplicados
    return {
      categories: [...new Set(categories.map(c => c.category))],
      subCategories: [...new Set(categories.map(c => c.subCategory))]
    };
  };

  // Obtener IDs de productos en el carrito para excluirlos
  const cartProductIds = cartData.map(item => item._id);

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

  const { categories, subCategories } = getCartCategories();

  return (
    <div className='flex flex-col border-t pt-14'>
      <div className='text-2xl mb-3'>
        <Title text1='CARRITO' text2='DE COMPRAS' />
      </div>

      <div className='flex flex-col gap-4'>
        <div className='hidden sm:grid grid-cols-[4fr_2fr_0.5fr] items-center gap-4 text-sm text-gray-500 pb-2'>
          <div>Producto</div>
          <div>Cantidad</div>
          <div></div>
        </div>

        {cartData.map((item, index) => {
          const productData = products.find((product) => product._id === item._id);
          if (!productData) return null;

          const productImage = productData.images?.[0] || productData.image?.[0] || assets.default_product;

          return (
            <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
              <div 
                onClick={() => navigate(`/product/${item._id}`)}
                className='flex items-start gap-4 cursor-pointer group hover:opacity-80 transition-opacity'
              >
                <div className='relative overflow-hidden rounded-md'>
                  <img 
                    className='w-16 sm:w-20 object-cover transition-transform group-hover:scale-105' 
                    src={productImage} 
                    alt={productData.name} 
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <p className='text-xs sm:text-lg font-medium group-hover:text-blue-600'>{productData.name}</p>
                  <div className='flex items-center gap-5 mt-2'>
                    <p>{currency} {productData.price}</p>
                    <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50 rounded-md'>{item.size}</p>
                  </div>
                </div>
              </div>
              <div className='relative'>
                <div className='sm:hidden absolute -top-4 left-0 text-xs text-gray-500 flex items-center gap-1'>
                  Editar
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className='flex items-center gap-2'>
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
                    className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1 rounded-md focus:ring-1 focus:ring-black/10 focus:border-gray-400 outline-none' 
                  />
                  <p className='hidden sm:block text-sm text-gray-500'>
                    × {currency}{productData.price}
                  </p>
                </div>
                <p className='hidden sm:block text-sm font-medium mt-1 text-right'>
                  {currency}{productData.price * item.quantity}
                </p>
              </div>
              <button
                onClick={() => updateQuantity(item._id, item.size, 0)}
                className='group p-1 hover:bg-red-50 rounded-full transition-colors'
                title="Eliminar producto"
              >
                <img 
                  src={assets.bin_icon} 
                  alt="Eliminar" 
                  className='w-4 mr-4 sm:w-5 group-hover:scale-110 transition-transform' 
                />
              </button>
            </div>
          )
        })}
      </div>
      
      <div className='flex justify-end my-10'>
        <div className='w-full sm:w-[450px] space-y-6'>
          <CartTotal />
          
          {/* Mostrar ahorro si existe */}
          {calculateSavings() > 0 && (
            <div className='bg-green-50 p-4 rounded-lg'>
              <p className='text-green-700 text-sm font-medium'>
                ¡Has ahorrado {currency}{calculateSavings()} en esta compra!
              </p>
            </div>
          )}

          <div className='w-full flex flex-col sm:flex-row gap-3'>
            <button 
              onClick={() => navigate('/collection')} 
              className='w-full sm:w-auto px-8 py-3 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors'
            >
              Seguir comprando
            </button>
            <button 
              onClick={() => navigate('/place-order')} 
              className='w-full sm:w-auto bg-black text-white px-8 py-3 rounded-md text-sm hover:bg-gray-800 transition-colors'
            >
              Continuar Compra
            </button>
          </div>
        </div>
      </div>

      {/* Productos relacionados - Solo si hay productos en el carrito */}
      {cartData.length > 0 && categories.length > 0 && (
        <div className='mt-5 mb-5'>
          <RelatedProducts 
            category={categories[0]}
            subCategory={subCategories[0]}
            excludeIds={cartProductIds}
          />
        </div>
      )}
    </div>
  )
}

export default Cart