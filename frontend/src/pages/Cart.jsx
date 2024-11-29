import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { motion, AnimatePresence } from 'framer-motion'
import { assets } from '../assets/assets'
import CartTotal from '../components/CartTotal'
import RelatedProducts from '../components/RelatedProducts'
import { Link } from 'react-router-dom'

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext)
  const [cartData, setCartData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const tempData = []
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          tempData.push({
            _id: items, 
            size: item, 
            quantity: cartItems[items][item]
          })
        }
      }
    }
    setCartData(tempData)
    setIsLoading(false)
  }, [cartItems])

  // Calcular ahorro total
  const calculateSavings = () => {
    let totalSavings = 0
    cartData.forEach(item => {
      const productData = products.find(product => product._id === item._id)
      if (productData?.originalPrice && productData.originalPrice > productData.price) {
        totalSavings += (productData.originalPrice - productData.price) * item.quantity
      }
    })
    return totalSavings
  }

  // Obtener categorías únicas de los productos en el carrito
  const getCartCategories = () => {
    const categories = cartData.map(item => {
      const product = products.find(p => p._id === item._id)
      return {
        category: product?.category,
        subCategory: product?.subCategory
      }
    }).filter(Boolean)

    return {
      categories: [...new Set(categories.map(c => c.category))],
      subCategories: [...new Set(categories.map(c => c.subCategory))]
    }
  }

  if (isLoading) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
      </div>
    )
  }

  if (cartData.length === 0) {
    return (
      <motion.div 
        className='flex flex-col items-center justify-center border-t pt-14 min-h-[60vh]'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className='text-2xl mb-8'>
          <h1 className='text-3xl font-medium text-center'>Carro de Compras</h1>
        </div>
        <div className='flex flex-col items-center gap-6'>
          <motion.img 
            src={assets.carritofb} 
            alt="Carrito vacío" 
            className='w-24 opacity-50'
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          />
          <h2 className='text-xl font-medium text-gray-600'>Tu Carro está vacío</h2>
          <p className='text-gray-500 text-center max-w-md'>
            ¡Aprovecha! Tenemos miles de productos en oferta y oportunidades únicas.
          </p>
          <Link to='/collection'>
            <motion.button 
              className='bg-black text-white px-8 py-3 mt-4 rounded-lg hover:bg-gray-800 transition-colors'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Ver ofertas
            </motion.button>
          </Link>
        </div>
      </motion.div>
    )
  }

  const { categories, subCategories } = getCartCategories()
  const cartProductIds = cartData.map(item => item._id)

  return (
    <motion.div 
      className='flex flex-col border-t pt-14'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h1 className='text-3xl font-medium mb-8 text-center'>Carro de Compras</h1>

      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Lista de productos */}
        <div className='flex-grow'>
          <div className='hidden sm:grid grid-cols-[4fr_2fr_0.5fr] items-center gap-4 text-sm text-gray-500 pb-4 border-b'>
            <div>Producto</div>
            <div>Cantidad</div>
            <div></div>
          </div>

          <AnimatePresence>
            {cartData.map((item, index) => {
              const productData = products.find((product) => product._id === item._id)
              if (!productData) return null

              const productImage = productData.images?.[0] || productData.image?.[0] || assets.default_product

              return (
                <motion.div
                  key={`${item._id}-${item.size}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className='py-6 border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'
                >
                  <Link 
                    to={`/product/${item._id}`}
                    className='flex items-start gap-4 group hover:opacity-90 transition-opacity'
                  >
                    <div className='relative overflow-hidden rounded-lg'>
                      <motion.img 
                        className='w-20 sm:w-24 aspect-[3/4] object-cover'
                        src={productImage} 
                        alt={productData.name}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className='flex flex-col gap-1'>
                      <p className='text-sm sm:text-base font-medium group-hover:text-blue-600 transition-colors'>
                        {productData.name}
                      </p>
                      <div className='flex items-center gap-3 mt-1'>
                        <p className='text-sm sm:text-base'>{currency} {productData.price.toLocaleString('es-CL')}</p>
                        <span className='px-2 py-1 text-xs border rounded-md bg-gray-50'>
                          {item.size}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className='relative'>
                    <div className='sm:hidden absolute -top-4 left-0 text-xs text-gray-500'>
                      Cantidad
                    </div>
                    <div className='flex items-center gap-2'>
                      <input 
                        type="number" 
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value)
                          if (value > 0) {
                            updateQuantity(item._id, item.size, value)
                          }
                        }}
                        className='w-16 px-2 py-1 border rounded-md focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none'
                      />
                      <p className='hidden sm:block text-sm text-gray-500'>
                        × {currency} {productData.price.toLocaleString('es-CL')}
                      </p>
                    </div>
                    <p className='hidden sm:block text-sm font-medium mt-1'>
                      {currency} {(productData.price * item.quantity).toLocaleString('es-CL')}
                    </p>
                  </div>

                  <motion.button
                    onClick={() => updateQuantity(item._id, item.size, 0)}
                    className='group p-2 hover:bg-red-50 rounded-full transition-colors'
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Eliminar producto"
                  >
                    <img 
                      src={assets.bin_icon} 
                      alt="Eliminar" 
                      className='w-5 opacity-60 group-hover:opacity-100' 
                    />
                  </motion.button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Resumen y acciones */}
        <div className='lg:w-[380px] space-y-6'>
          <CartTotal />
          
          {calculateSavings() > 0 && (
            <motion.div 
              className='bg-green-50 p-4 rounded-lg'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className='text-green-700 text-sm font-medium'>
                ¡Has ahorrado {currency} {calculateSavings().toLocaleString('es-CL')} en esta compra!
              </p>
            </motion.div>
          )}

          <div className='flex flex-col gap-3'>
            <Link to='/collection'>
              <motion.button 
                className='w-full px-6 py-3 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors'
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Seguir comprando
              </motion.button>
            </Link>
            <Link to='/place-order'>
              <motion.button 
                className='w-full px-6 py-3 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors'
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Continuar Compra
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      {/* Productos relacionados */}
      {cartData.length > 0 && categories.length > 0 && (
        <div className='mt-16'>
          <RelatedProducts 
            category={categories[0]}
            subCategory={subCategories[0]}
            excludeIds={cartProductIds}
          />
        </div>
      )}
    </motion.div>
  )
}

export default Cart