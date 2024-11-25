import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom';

const ProductItem = ({id, image, name, price}) => {
    const {currency} = useContext(ShopContext);
    const imageUrl = image && image.length > 0 ? image[0] : '';

    return (
        <Link className='cursor-pointer text-gray-700' to={`/product/${id}`}>
            <div className='overflow-hidden'>
                <img 
                    src={imageUrl} 
                    alt={name} 
                    className='hover:scale-110 transition ease-in-out'
                    onError={(e) => {
                        e.target.src = '';
                    }}
                />
            </div>
            <p className='pt-3 pb-1 text-sm'>{name}</p>
            <p className='text-sm font-medium'>{currency}{price}</p>
        </Link>
    )
}

export default ProductItem