import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'

const NewsletterBox = () => {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!email) {
            toast.error('Por favor ingresa tu correo electrónico')
            return
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            toast.error('Por favor ingresa un correo electrónico válido')
            return
        }

        setIsLoading(true)
        
        try {
            // Aquí iría la lógica para suscribir el email
            await new Promise(resolve => setTimeout(resolve, 1000)) // Simulación
            toast.success('¡Gracias por suscribirte!')
            setEmail('')
        } catch (error) {
            toast.error('Hubo un error al suscribirte. Por favor intenta nuevamente.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section className='py-8 bg-gray-50'>
            <motion.div 
                className='max-w-3xl mx-auto px-6 text-center space-y-8'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                <div className='space-y-4'>
                    <h2 className='text-3xl md:text-4xl font-medium text-gray-900'>
                        Obtén un 10% de descuento
                    </h2>
                    <p className='text-gray-600 max-w-2xl mx-auto'>
                        Suscríbete a nuestro newsletter y recibe un 10% de descuento en tu primera compra, además de noticias exclusivas y ofertas especiales.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className='max-w-md mx-auto'>
                    <div className='flex gap-3'>
                        <input
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='Ingresa tu correo electrónico'
                            className='flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors outline-none'
                        />
                        <button
                            type='submit'
                            disabled={isLoading}
                            className={`
                                px-6 py-3 bg-gray-900 text-white rounded-lg font-medium
                                transition-all duration-200
                                ${isLoading 
                                    ? 'opacity-70 cursor-not-allowed' 
                                    : 'hover:bg-gray-800 active:transform active:scale-95'
                                }
                            `}
                        >
                            {isLoading ? (
                                <span className='flex items-center gap-2'>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Suscribiendo...
                                </span>
                            ) : 'Suscribirse'}
                        </button>
                    </div>
                </form>

                <p className='text-sm text-gray-500'>
                    Al suscribirte, aceptas recibir correos de marketing. Puedes darte de baja en cualquier momento.
                </p>
            </motion.div>
        </section>
    )
}

export default NewsletterBox