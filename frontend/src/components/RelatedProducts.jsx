import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { motion } from 'framer-motion'
import ProductItem from './ProductItem'

const RelatedProducts = ({ category, subCategory }) => {
    const { products } = useContext(ShopContext)
    const [related, setRelated] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (products.length > 0) {
            setIsLoading(true)
            const filtered = products
                .filter(item => category === item.category && subCategory === item.subCategory)
                .slice(0, 5)
            setRelated(filtered)
            setIsLoading(false)
        }
    }, [products, category, subCategory])

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    return (
        <section className='py-16 border-t'>
            <motion.div
                className='space-y-12'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                <div className='text-center space-y-4'>
                    <h2 className='text-3xl md:text-4xl prata-regular'>
                        Productos Relacionados
                    </h2>
                    <p className='text-gray-600 max-w-2xl mx-auto'>
                        Descubre más productos similares que podrían interesarte
                    </p>
                </div>

                {isLoading ? (
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-8'>
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className='animate-pulse'>
                                <div className='bg-gray-200 rounded-lg aspect-[3/4] mb-3'></div>
                                <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                                <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                            </div>
                        ))}
                    </div>
                ) : related.length > 0 ? (
                    <motion.div
                        className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-8'
                        variants={container}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                    >
                        {related.map((item) => (
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
                ) : (
                    <p className='text-center text-gray-500'>
                        No hay productos relacionados disponibles
                    </p>
                )}
            </motion.div>
        </section>
    )
}

export default RelatedProducts