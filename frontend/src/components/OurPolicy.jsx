import React from 'react'
import { assets } from '../assets/assets'
import { motion } from 'framer-motion'

const OurPolicy = () => {
  const policies = [
    {
      icon: assets.exchange_icon,
      title: 'Política de intercambio fácil y rápido',
      description: 'Ofrecemos un proceso de intercambio simple y eficiente para garantizar tu satisfacción con cada compra.'
    },
    {
      icon: assets.quality_icon,
      title: 'Política de 7 días de devolución',
      description: 'Tienes 7 días para devolver tu producto si no estás completamente satisfecho con tu compra.'
    },
    {
      icon: assets.support_img,
      title: 'Mejor servicio al cliente',
      description: 'Nuestro equipo está disponible 24/7 para ayudarte con cualquier consulta o problema que puedas tener.'
    }
  ]

  return (
    <section className='py-24 bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4'>
        <motion.div 
          className='grid grid-cols-1 sm:grid-cols-3 gap-12'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {policies.map((policy, index) => (
            <motion.div
              key={index}
              className='text-center space-y-4'
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <div className='relative w-16 h-16 mx-auto'>
                <motion.div
                  className='absolute inset-0 bg-gray-200 rounded-full'
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 + 0.2 }}
                />
                <img 
                  src={policy.icon} 
                  className='relative w-full h-full p-3 object-contain' 
                  alt={policy.title}
                />
              </div>
              
              <h3 className='text-lg font-medium text-gray-900'>
                {policy.title}
              </h3>
              
              <p className='text-sm text-gray-500 leading-relaxed max-w-xs mx-auto'>
                {policy.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default OurPolicy