import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const ProductItem = ({ id, image, name, price }) => {
    const { currency } = useContext(ShopContext)
    const imageUrl = image && image.length > 0 ? image[0] : ''

    return (
        <Link 
            to={`/product/${id}`}
            className='group block'
        >
            <div className='space-y-2'>
                <div className='relative overflow-hidden rounded-lg bg-gray-100 aspect-[3/4]'>
                    <motion.img 
                        src={imageUrl} 
                        alt={name}
                        className='w-full h-full object-cover object-center'
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        onError={(e) => {
                            e.target.src = 'ruta/a/imagen/por/defecto.jpg'
                        }}
                    />
                    <div className='absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300' />
                </div>
                
                <div className='space-y-1 px-1'>
                    <h3 className='text-sm text-gray-700 group-hover:text-black transition-colors line-clamp-2'>
                        {name}
                    </h3>
                    <p className='text-sm font-medium text-gray-900'>
                        {currency}{price?.toLocaleString('es-CL')}
                    </p>
                </div>
            </div>
        </Link>
    )
}

export default ProductItem