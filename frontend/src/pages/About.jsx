import React from 'react'
import { motion } from 'framer-motion'
import { assets } from '../assets/assets'
import NewsLetterBox from '../components/NewsletterBox'

const About = () => {
  const features = [
    {
      title: 'Calidad Asegurada',
      description: 'Utilizamos materiales de alta calidad para garantizar la durabilidad y comodidad de nuestras prendas.'
    },
    {
      title: 'Diseño Único',
      description: 'Cada prenda es diseñada para reflejar la personalidad y estilo de tu mascota.'
    },
    {
      title: 'Variedad de Estilos',
      description: 'Ofrecemos una amplia variedad de estilos y colores para que cada mascota se vea única.'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='space-y-16'
    >
      <div className='text-center pt-8 border-t'>
        <motion.h1 
          className='text-3xl md:text-4xl font-medium mb-2'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Acerca de Nosotros
        </motion.h1>
      </div>

      <motion.div 
        className='flex flex-col md:flex-row gap-16 items-center'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.img 
          className='w-full md:max-w-[450px] rounded-lg shadow-lg'
          src={assets.about_img} 
          alt="Sobre nosotros"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
          <p className='text-lg'>Harry's Boutique es un emprendimiento de ropa para mascotas.</p>
          <p>Desde 2020, nos dedicamos a crear prendas únicas y cómodas para nuestros amigos peludos.</p>
          <h2 className='text-xl font-medium text-gray-800'>Nuestra Misión</h2>
          <p>Nuestro objetivo es ofrecer productos de alta calidad que sean cómodos y duraderos, y que reflejen la personalidad y estilo de cada mascota.</p>
        </div>
      </motion.div>

      <motion.div
        className='space-y-8'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className='text-2xl font-medium text-center'>¿Por qué Escogernos?</h2>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className='border p-8 rounded-lg hover:shadow-lg transition-shadow'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * index }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className='text-lg font-medium mb-4'>{feature.title}</h3>
              <p className='text-gray-600'>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <NewsLetterBox />
    </motion.div>
  )
}

export default About