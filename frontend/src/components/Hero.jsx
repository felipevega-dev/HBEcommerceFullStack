import React from 'react'
import { assets } from '../assets/assets'

const Hero = () => {
  return (
    <div className='flex flex-col sm:flex-row border border-gray-400'>
      {/* left */}
      <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0'>
        <div className='text-[#414141]'>
          <div className='flex items-center gap-2'>
            <p className='w-8 md:w-11 h-[2px] bg-[#414141]'></p>
            <p className='text-sm font-medium md:text-base'>MÁS VENDIDAS</p>
          </div>
          <h1 className='text-3xl sm:py-3 lg:text-5xl leading-relaxed prata-regular'>Ultimo Productos</h1>
          <div className='flex items-center gap-2'>
            <p className='text-sm font-semibold md:text-base'>COMPRAR AHORA</p>
            <p className='w-8 md:w-11 h-[1px] bg-[#414141]'></p>
          </div>
        </div>
      </div>
      {/* right */}
      <img className='w-full sm:w-1/2' src={assets.hero_img} alt='hero' />
    </div>
  )
}

export default Hero