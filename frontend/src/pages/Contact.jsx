import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsLetterBox from '../components/NewsLetterBox'
const Contact = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 border-t'>
        <Title text1='CONTACTANOS' text2='PARA SABER MÁS' />
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28'>
        <img className='w-full md:max-w-[480px]' src={assets.contact_img} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='text-xl font-semibold text-gray-600'>Nuestra Tienda</p>
          <p className='text-gray-500'>Cardenal #2269 <br /> Arica, Chile</p>
          <p className='text-gray-500'>Tel: (+569) 8456 7890 <br /> Email: info@harrysboutique.cl</p>
          <p className='font-semibold text-xl text-gray-600'>Carrera en Harry's Boutique</p>
          <p className='text-gray-500'>Aprende más sobre nosotros y nuestras ofertas de trabajo.	</p>
          <button className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>¡Explora Ofertas!</button>
        </div>
      </div>
      <NewsLetterBox />
    </div>
  )
}

export default Contact