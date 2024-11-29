import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { assets } from '../assets/assets'
import NewsLetterBox from '../components/NewsletterBox'
import { toast } from 'react-toastify'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Aquí iría la lógica para enviar el formulario
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success('Mensaje enviado correctamente')
    setFormData({ name: '', email: '', message: '' })
    setIsLoading(false)
  }

  const contactInfo = [
    {
      title: 'Nuestra Tienda',
      details: [
        'Cardenal #2269',
        'Arica, Chile',
        'Tel: (+569) 8456 7890',
        'Email: info@harrysboutique.cl'
      ]
    },
    {
      title: 'Carrera en Harry\'s Boutique',
      details: ['Aprende más sobre nosotros y nuestras ofertas de trabajo.']
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='space-y-16'
    >
      <div className='text-center pt-10 border-t'>
        <motion.h1 
          className='text-3xl md:text-4xl font-medium mb-2'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Contáctanos
        </motion.h1>
      </div>

      <div className='flex flex-col md:flex-row gap-12 items-center'>
        <motion.img
          className='w-full md:max-w-[480px] rounded-lg shadow-lg'
          src={assets.contact_img}
          alt="Contacto"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        />

        <motion.div 
          className='flex-1 space-y-8'
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {contactInfo.map((section, index) => (
            <div key={section.title} className='space-y-4'>
              <h2 className='text-xl font-medium text-gray-800'>{section.title}</h2>
              {section.details.map((detail, i) => (
                <p key={i} className='text-gray-600'>{detail}</p>
              ))}
            </div>
          ))}

          <motion.form 
            onSubmit={handleSubmit}
            className='space-y-6 mt-8'
          >
            <div className='space-y-4'>
              <input
                type="text"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors outline-none'
              />
              <input
                type="email"
                placeholder="Tu email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors outline-none'
              />
              <textarea
                placeholder="Tu mensaje"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={4}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors outline-none resize-none'
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className='w-full sm:w-auto px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <span className='flex items-center justify-center gap-2'>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Enviando...
                </span>
              ) : 'Enviar Mensaje'}
            </motion.button>
          </motion.form>
        </motion.div>
      </div>

      <NewsLetterBox />
    </motion.div>
  )
}

export default Contact