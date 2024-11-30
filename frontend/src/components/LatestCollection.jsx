import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import { motion } from 'framer-motion'
import ProductItem from './ProductItem'
import { Link } from 'react-router-dom'
const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (products.length > 0) {
      // Ordenar productos por fecha y tomar los últimos 10
      const sorted = [...products]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);
      setLatestProducts(sorted);
      setIsLoading(false);
    }
  }, [products]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <section className='space-y-12'>
      <motion.div 
        className='text-center space-y-4'
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h1 className='text-3xl font-medium'>
          Últimas Colecciones
        </h1>
        <p className='text-gray-600 text-sm max-w-2xl mx-auto'>
          Descubre nuestras últimas novedades, diseños exclusivos que reflejan las últimas tendencias en moda
        </p>
      </motion.div>

      {isLoading ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-8'>
          {[...Array(10)].map((_, index) => (
            <div key={index} className='animate-pulse'>
              <div className='bg-gray-200 rounded-lg aspect-[3/4] mb-3'></div>
              <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
              <div className='h-4 bg-gray-200 rounded w-1/2'></div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div 
          className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-8'
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {latestProducts.map((item) => (
            <motion.div
              key={item._id}
              whileHover={{ y: -5 }}
              transition={{ type: "tween" }}
            >
              <ProductItem
                id={item._id}
                image={item.images}
                name={item.name}
                price={item.price}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div 
        className='text-center'
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <Link to='/collection'>
          <button 
            className='px-8 py-3 border border-gray-800 hover:bg-gray-800 hover:text-white transition-colors rounded-md'
        >
            Ver Toda la Colección
          </button>
        </Link>
      </motion.div>
    </section>
  )
}

export default LatestCollection