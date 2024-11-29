import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext';
import { useParams } from 'react-router-dom';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import Review, { ReviewForm } from '../components/Review';
import { toast } from 'react-toastify';
import axios from 'axios';

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, token, backendUrl, navigate } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [size, setSize] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [addedItem, setAddedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductData = () => {
      const product = products.find(item => item._id === productId);
      if (product) {
        setProductData(product);
        if (product.images && product.images.length > 0) {
          setCurrentImage(product.images[0]);
        }
      }
    };

    if (products.length > 0) {
      fetchProductData();
    }
  }, [productId, products]);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${backendUrl}/api/review/product/${productId}?page=${pageNum}&limit=5`
      );

      if (response.data.success) {
        if (pageNum === 1) {
          setReviews(response.data.reviews);
        } else {
          setReviews(prev => [...prev, ...response.data.reviews]);
        }
        setHasMore(response.data.pagination.hasMore);
        setPage(response.data.pagination.current);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    if (!token) {
      navigate('/login', { state: { from: `/product/${productId}` } });
      return;
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
      );

      if (response.data.success) {
        toast.success('Reseña publicada exitosamente');
        // Recargar las reseñas para mostrar la nueva
        setPage(1);
        fetchReviews(1);
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message === 'Ya has revisado este producto') {
        toast.error('Ya has publicado una reseña para este producto');
      } else {
        toast.error('Error al publicar la reseña');
      }
    }
  };

  const scrollToReviews = () => {
    setActiveTab('reviews');
    document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddToCart = async () => {
    if (!size) {
      toast.warning('Por favor selecciona una talla');
      return;
    }

    setIsAddingToCart(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    addToCart(productData._id, size, quantity);

    setAddedItem({
      name: productData.name,
      image: productData.images[0],
      size: size,
      price: productData.price,
      quantity: quantity
    });
    setShowCartModal(true);
    setIsAddingToCart(false);
  };

  const handleQuantityChange = async (newQuantity) => {
    setQuantity(newQuantity);
    await addToCart(productData._id, size, newQuantity - quantity);
    setAddedItem({
      ...addedItem,
      quantity: newQuantity
    });
  };

  if (!productData) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  }

  return (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/* Product Data */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        {/* Product Images */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%]'>
            {productData.images && productData.images.map((item, index) => (
              <img 
                onClick={() => setCurrentImage(item)} 
                src={item} 
                key={index} 
                alt={`${productData.name}-${index}`}
                className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' 
              />
            ))}
          </div>
          <div className='w-full sm:w-[80%]'>
            <img 
              className='w-full h-auto' 
              src={currentImage || (productData.images && productData.images[0])} 
              alt={productData.name} 
            />
          </div>
        </div>

        {/* Product Details */}
        <div className='flex-1'>
          <h1 className='text-2xl font-medium mt-2'>{productData.name}</h1>
          <div className='flex items-center gap-1 mt-2 cursor-pointer' onClick={scrollToReviews}>
            {[...Array(5)].map((_, index) => (
              <img
                key={index}
                src={index < Math.round(productData.rating?.average || 0) ? assets.star_icon : assets.star_dull_icon}
                alt='rating'
                className='w-3 h-3'
              />
            ))}
            <p className='text-sm text-gray-500 hover:text-gray-700'>
              ({productData.rating?.count || 0} {productData.rating?.count === 1 ? 'valoración' : 'valoraciones'})
            </p>
          </div>
          <p className='text-2xl font-medium mt-2'>{currency}{productData.price}</p>
          <p className='md:w-4/5 text-gray-600 mt-2'>{productData.description}</p>
          
          {/* Sizes Section */}
          {productData.sizes && productData.sizes.length > 0 && (
            <div className='flex flex-col gap-4 my-8'>
              <p className='text-lg font-medium'>Selecciona Talla</p>
              <div className='flex gap-2'>
                {productData.sizes.map((item, index) => (
                  <button 
                    onClick={() => setSize(item)} 
                    className={`border py-2 px-4 bg-gray-100 rounded-md ${size === item ? 'border-orange-500' : ''}`} 
                    key={index}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={handleAddToCart}
            disabled={isAddingToCart} 
            className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700 rounded-md disabled:opacity-75 disabled:cursor-not-allowed'
          >
            {isAddingToCart ? 'Agregando...' : 'Añadir al carro'}
          </button>

          {/* Modal de Carrito */}
          {showCartModal && addedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
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
                
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={addedItem.image} 
                    alt={addedItem.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{addedItem.name}</p>
                    <p className="text-sm text-gray-600">Talla: {addedItem.size}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-sm text-gray-600">Cantidad: {quantity}</p>
                      <p className="text-sm font-medium">{currency}{addedItem.price * quantity}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCartModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                  >
                    Seguir comprando
                  </button>
                  <button
                    onClick={() => {
                      setShowCartModal(false);
                      navigate('/cart');
                    }}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800"
                  >
                    Ver carrito
                  </button>
                </div>
              </div>
            </div>
          )}

          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>Producto 100% original</p>
            <p>Devoluciones gratis por 7 días</p>
            <p>Servicio de asistencia al cliente</p>  
          </div>
        </div>
      </div>

      {/* Product Description y reviews */}
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
            <p className='text-sm text-gray-500'>{productData.description}</p>
          ) : (
            <div className='space-y-6'>
              {token && <ReviewForm onSubmit={handleSubmitReview} isLoading={loading} />}
              
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
                    <button
                      onClick={() => fetchReviews(page + 1)}
                      className='w-full py-2 text-sm text-gray-600 hover:text-gray-800'
                      disabled={loading}
                    >
                      {loading ? 'Cargando más reseñas...' : 'Cargar más reseñas'}
                    </button>
                  )}
                </div>
              ) : (
                <p className='text-center text-gray-500'>
                  No hay reseñas aún. ¡Sé el primero en opinar!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div className='mt-20'>
        <RelatedProducts 
          category={productData.category} 
          subCategory={productData.subCategory} 
        />
      </div>
    </div>
  )
}

export default Product