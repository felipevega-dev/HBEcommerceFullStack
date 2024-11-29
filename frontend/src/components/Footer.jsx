import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Footer = () => {
  const footerLinks = {
    company: [
      { label: 'Inicio', path: '/' },
      { label: 'Acerca de nosotros', path: '/about' },
      { label: 'Delivery', path: '/delivery' },
      { label: 'Políticas de privacidad', path: '/politicas' },
    ],
    contact: [
      { label: '+56 9 6680 6911', href: 'tel:+56966806911' },
      { label: 'harrysboutique.cl@gmail.com', href: 'mailto:harrysboutique.cl@gmail.com' },
    ]
  }

  return (
    <footer className='mt-12 bg-gray-50'>
      <div className='px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-16'>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-12 lg:gap-16'>
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='space-y-6'
          >
            <Link to='/'>
              <img 
                src={assets.logo_footer} 
                className='w-32 transition-transform hover:scale-105' 
                alt='Harry´s Boutique' 
              />
            </Link>
            <p className='text-gray-600 text-sm leading-relaxed'>
              Harry's Boutique, tu tienda de ropa para mascotas. Diseños exclusivos y de alta calidad para tu mejor amigo.
            </p>
            <div className='flex gap-4'>
              {[
                { 
                  name: 'facebook', 
                  url: 'https://www.facebook.com/harrys.petshop'
                },
                { 
                  name: 'instagram', 
                  url: 'https://www.instagram.com/harrysboutique.cl/'
                }
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors'
                >
                  <img 
                    src={assets[`${social.name}_icon`]} 
                    className='w-5 h-5 opacity-80' 
                    alt={social.name} 
                  />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className='space-y-6'
          >
            <h3 className='text-lg font-medium'>COMPAÑÍA</h3>
            <ul className='space-y-3'>
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path}
                    className='text-gray-600 hover:text-gray-900 transition-colors text-sm'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className='space-y-6'
          >
            <h3 className='text-lg font-medium'>CONTACTO</h3>
            <ul className='space-y-3'>
              {footerLinks.contact.map((contact, index) => (
                <li key={index}>
                  <a 
                    href={contact.href}
                    className='text-gray-600 hover:text-gray-900 transition-colors text-sm'
                  >
                    {contact.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Copyright */}
      <div className='border-t border-gray-200'>
        <div className='px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-6'>
          <p className='text-center text-sm text-gray-500'>
            © {new Date().getFullYear()} Harrysboutique.cl - Todos los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer