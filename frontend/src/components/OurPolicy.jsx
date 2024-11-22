import React from 'react'
import { assets } from '../assets/assets'

const OurPolicy = () => {
  return (
    <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700'>
        <div>
            <img src={assets.exchange_icon} className='w-12 m-auto mb-5' alt='icon' />
            <p className='font-semibold'>Politica de intercambio facil y rapido</p>
            <p className='text-gray-400'>Ofrecemos un intercambio fácil y rápido para que puedas devolver tu producto si no estás satisfecho.</p>
        </div>
        <div>
            <img src={assets.quality_icon} className='w-12 m-auto mb-5' alt='icon' />
            <p className='font-semibold'>Politica de 7 dias de devolucion</p>
            <p className='text-gray-400'>Ofrecemos un intercambio fácil y rápido para que puedas devolver tu producto si no estás satisfecho.</p>
        </div>
        <div>
            <img src={assets.support_img} className='w-12 m-auto mb-5' alt='icon' />
            <p className='font-semibold'>Mejor servicio al cliente</p>
            <p className='text-gray-400'>Ofrecemos un servicio al cliente 24/7 para que puedas resolver cualquier problema que tengas.  </p>
        </div>
    </div>
  )
}

export default OurPolicy