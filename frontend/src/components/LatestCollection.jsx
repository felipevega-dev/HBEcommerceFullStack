import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
const LatestCollection = () => {
  const { products } = useContext(ShopContext);

  return (
    <div className='my-10'>
      <div className='text-center py-8 text-3xl'>
        <Title text1='ÚLTIMAS' text2='COLECCIONES' />
        <p className='w-3/4 mx-auto text-gray-600 text-xs md:text-base'>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
        </p>
      </div>
    </div>
  )
}

export default LatestCollection