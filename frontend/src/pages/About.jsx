import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsLetterBox from '../components/NewsLetterBox'

const About = () => {
  return (
    <div>
      
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1='ACERCA' text2='DE NOSOTROS' />
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
          <p>Harry's Boutique es un emprendimiento de ropa para mascotas.</p>
          <p>Desde 2020, nos dedicamos a crear prendas únicas y cómodas para nuestros amigos peludos.</p>
          <b className='text-gray-800'>Nuestra Misión</b>
          <p>Nuestro objetivo es ofrecer productos de alta calidad que sean cómodos y duraderos, y que reflejen la personalidad y estilo de cada mascota.</p>
        </div>
      </div>

      <div className='text-xl py-4'>
        <Title text1='POR QUÉ' text2='ESCOGERNOS?' />
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Calidad Asegurada</b>
          <p className='text-gray-600'>Utilizamos materiales de alta calidad para garantizar la durabilidad y comodidad de nuestras prendas.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Diseño Único</b>
          <p className='text-gray-600'>Cada prenda es diseñada para reflejar la personalidad y estilo de tu mascota.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Variedad de Estilos</b>
          <p className='text-gray-600'>Ofrecemos una amplia variedad de estilos y colores para que cada mascota se vea única.</p>
        </div>
      </div>

      <NewsLetterBox />
      
    </div>
  )
}

export default About