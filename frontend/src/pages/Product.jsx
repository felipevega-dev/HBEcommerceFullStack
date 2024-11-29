import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { assets } from '../assets/assets'
import RelatedProducts from '../components/RelatedProducts'
import Review, { ReviewForm } from '../components/Review'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'react-toastify'
import axios from 'axios'

const Product = () => {
  const { productId } = useParams()
  const { products, currency, addToCart, token, backendUrl, navigate } = useContext(ShopContext)
  const [productData, setProductData] = useState(null)
  const [currentImage, setCurrentImage] = useState('')
  const [size, setSize] = useState('')
  const [activeTab, setActiveTab] = useState('description')
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)
  const [addedItem, setAddedItem] = useState(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProductData = () => {
      const product = products.find(item => item._id === productId)
      if (product) {
        setProductData(product)
        if (product.images && product.images.length > 0) {
          setCurrentImage(product.images[0])
        }
      }
    }

    if (products.length > 0) {
      fetchProductData()
    }
  }, [productId, products])

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async (pageNum = 1) => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${backendUrl}/api/review/product/${productId}?page=${pageNum}&limit=5`
      )

      if (response.data.success) {
        if (pageNum === 1) {
          setReviews(response.data.reviews)
        } else {
          setReviews(prev => [...prev, ...response.data.reviews])
        }
        setHasMore(response.data.pagination.hasMore)
        setPage(response.data.pagination.current)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (reviewData) => {
    if (!token) {
      navigate('/login', { state: { from: `/product/${productId}` } })
      return
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/review`,
        {
          productId,
          ...reviewData
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.data.success) {
        toast.success('Reseña publicada exitosamente')
        setPage(1)
        fetchReviews(1)
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message === 'Ya has revisado este producto') {
        toast.error('Ya has publicado una reseña para este producto')
      } else {
        toast.error('Error al publicar la reseña')
      }
    }
  }

  const handleAddToCart = async () => {
    if (!size) {
      toast.warning('Por favor selecciona una talla')
      return
    }

    setIsAddingToCart(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    addToCart(productData._id, size, quantity)

    setAddedItem({
      name: productData.name,
      image: productData.images[0],
      size: size,
      price: productData.price,
      quantity: quantity
    })
    setShowCartModal(true)
    setIsAddingToCart(false)
  }

  if (!productData) {
    return <LoadingSpinner />
  }

  return (
    <motion.div 
      className='border-t pt-10'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Product Images and Details */}
      <div className='flex flex-col lg:flex-row gap-12'>
        {/* Images Section */}
        <div className='flex-1 flex flex-col-reverse lg:flex-row gap-4'>
          {/* Thumbnails */}
          <div className='flex lg:flex-col overflow-x-auto lg:w-24 gap-2'>
            {productData.images?.map((image, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentImage(image)}
                className={`relative rounded-lg overflow-hidden flex-shrink-0 
                  ${currentImage === image ? 'ring-2 ring-black' : 'hover:opacity-80'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img 
                  src={image} 
                  alt={`${productData.name}-${index}`}
                  className='w-20 h-20 object-cover'
                />
              </motion.button>
            ))}
          </div>

          {/* Main Image */}
          <div className='flex-1'>
            <motion.div
              className='relative rounded-lg overflow-hidden'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <img 
                src={currentImage || productData.images?.[0]} 
                alt={productData.name}
                className='w-full h-auto'
              />
            </motion.div>
          </div>
        </div>

        {/* Product Details */}
        <div className='flex-1 space-y-6'>
          <div>
            <h1 className='text-2xl font-medium'>{productData.name}</h1>
            <div className='flex items-center gap-2 mt-2'>
              <div className='flex items-center'>
                {[...Array(5)].map((_, index) => (
                  <img
                    key={index}
                    src={index < Math.round(productData.rating?.average || 0) ? assets.star_icon : assets.star_dull_icon}
                    alt='rating'
                    className='w-4 h-4'
                  />
                ))}
              </div>
              <button 
                onClick={() => {
                  setActiveTab('reviews')
                  document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className='text-sm text-gray-500 hover:text-gray-700'
              >
                ({productData.rating?.count || 0} {productData.rating?.count === 1 ? 'valoración' : 'valoraciones'})
              </button>
            </div>
          </div>

          <div className='space-y-4'>
            <p className='text-2xl font-medium'>{currency} {productData.price.toLocaleString('es-CL')}</p>
            <p className='text-gray-600'>{productData.description}</p>
          </div>

          {/* Sizes */}
          {productData.sizes && productData.sizes.length > 0 && (
            <div className='space-y-4'>
              <p className='font-medium'>Selecciona Talla</p>
              <div className='flex flex-wrap gap-2'>
                {productData.sizes.map((item) => (
                  <motion.button
                    key={item}
                    onClick={() => setSize(item)}
                    className={`px-4 py-2 rounded-lg border ${
                      size === item 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <motion.button
            onClick={handleAddToCart}
            disabled={isAddingToCart || !size}
            className={`
              w-full py-3 rounded-lg font-medium
              ${isAddingToCart || !size 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
              }
            `}
            whileHover={!isAddingToCart && size ? { scale: 1.02 } : {}}
            whileTap={!isAddingToCart && size ? { scale: 0.98 } : {}}
          >
            {isAddingToCart ? 'Agregando...' : 'Añadir al carrito'}
          </motion.button>

          {/* Features */}
          <div className='pt-6 border-t space-y-2 text-sm text-gray-500'>
            <p>✓ Producto 100% original</p>
            <p>✓ Devoluciones gratis por 7 días</p>
            <p>✓ Servicio de asistencia al cliente</p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className='mt-20' id="reviews-section">
        <div className='flex border-b'>
          <button
            className={`px-5 py-3 text-sm ${
              activeTab === 'description' ? 'border-b-2 border-black font-medium' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('description')}
          >
            Descripción
          </button>
          <button
            className={`px-5 py-3 text-sm ${
              activeTab === 'reviews' ? 'border-b-2 border-black font-medium' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('reviews')}
          >
            Reseñas ({productData.rating?.count || 0})
          </button>
        </div>

        <div className='p-6'>
          {activeTab === 'description' ? (
            <p className='text-gray-600 leading-relaxed'>{productData.description}</p>
          ) : (
            <div className='space-y-8'>
              {/* Lista de reseñas existentes */}
              {reviews.length > 0 ? (
                <div className='space-y-6'>
                  {reviews.map((review) => (
                    <Review
                      key={review._id}
                      review={review}
                      isUserReview={review.userId._id === token}
                    />
                  ))}
                  
                  {hasMore && (
                    <motion.button
                      onClick={() => fetchReviews(page + 1)}
                      className='w-full py-2 text-sm text-gray-600 hover:text-gray-800'
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? 'Cargando más reseñas...' : 'Cargar más reseñas'}
                    </motion.button>
                  )}
                </div>
              ) : (
                <p className='text-center text-gray-500'>
                  No hay reseñas aún. ¡Sé el primero en opinar!
                </p>
              )}

              {/* Formulario de reseña */}
              {token && <ReviewForm onSubmit={handleSubmitReview} isLoading={loading} />}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts 
        category={productData.category} 
        subCategory={productData.subCategory} 
      />

      {/* Cart Modal */}
      <AnimatePresence>
        {showCartModal && addedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-lg max-w-md w-full"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium">¡Producto agregado!</h3>
                <button 
                  onClick={() => setShowCartModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={addedItem.image} 
                  alt={addedItem.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium">{addedItem.name}</p>
                  <p className="text-sm text-gray-600">Talla: {addedItem.size}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-sm text-gray-600">Cantidad: {quantity}</p>
                    <p className="text-sm font-medium">
                      {currency} {(addedItem.price * quantity).toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCartModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  Seguir comprando
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowCartModal(false)
                    navigate('/cart')
                  }}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
                >
                  Ver carrito
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Product