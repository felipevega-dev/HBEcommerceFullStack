import React from 'react'
import { motion } from 'framer-motion'

const Politicas = () => {
  const policies = [
    {
      title: 'Política de Privacidad',
      content: [
        'Protegemos tu información personal y no la compartimos con terceros.',
        'Solo recopilamos datos necesarios para procesar tu pedido y mejorar tu experiencia.',
        'Utilizamos métodos seguros de encriptación para proteger tus datos de pago.',
        'Puedes solicitar la eliminación de tus datos en cualquier momento.'
      ]
    },
    {
      title: 'Política de Devoluciones',
      content: [
        'Tienes 7 días desde la recepción para devolver tu producto.',
        'El producto debe estar sin uso y con todas sus etiquetas originales.',
        'Reembolsaremos el valor total del producto (excluye costos de envío).',
        'Para iniciar una devolución, contáctanos por correo electrónico.'
      ]
    },
    {
      title: 'Política de Envíos',
      content: [
        'Procesamos los pedidos en 24-48 horas hábiles.',
        'Envío gratis en compras superiores a $30.000.',
        'Trabajamos con empresas de courier confiables.',
        'Proporcionamos seguimiento en tiempo real de tu pedido.'
      ]
    },
    {
      title: 'Garantía de Productos',
      content: [
        'Garantizamos la calidad y autenticidad de todos nuestros productos.',
        'Verificamos cada prenda antes del envío.',
        'En caso de defectos de fábrica, reemplazamos el producto sin costo.',
        'La garantía cubre 30 días desde la compra.'
      ]
    },
    {
      title: 'Métodos de Pago',
      content: [
        'Aceptamos todas las tarjetas de crédito y débito.',
        'Transferencias bancarias disponibles.',
        'Procesamos pagos de forma segura.',
        'No almacenamos datos de tarjetas de crédito.'
      ]
    }
  ]

  return (
    <motion.div 
      className="max-w-4xl mx-auto px-6 py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-medium">Políticas de la Tienda</h1>
          <p className="text-gray-600">
            Tu confianza es nuestra prioridad. Conoce nuestras políticas y términos de servicio.
          </p>
        </div>

        <div className="space-y-8">
          {policies.map((policy, index) => (
            <motion.div
              key={index}
              className="border rounded-lg p-6 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h2 className="text-xl font-medium">{policy.title}</h2>
              <ul className="space-y-2">
                {policy.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600">
                    <span className="text-black mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Sección de contacto */}
        <div className="bg-gray-50 p-8 rounded-lg text-center space-y-4">
          <h2 className="text-xl font-medium">¿Tienes alguna pregunta?</h2>
          <p className="text-gray-600">
            No dudes en contactarnos si necesitas más información sobre nuestras políticas
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="mailto:harrysboutique.cl@gmail.com"
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Contáctanos
            </a>
          </div>
        </div>

        {/* Nota legal */}
        <p className="text-sm text-gray-500 text-center">
          Estas políticas fueron actualizadas por última vez el {new Date().toLocaleDateString()}. 
          Nos reservamos el derecho de modificar estas políticas en cualquier momento.
        </p>
      </div>
    </motion.div>
  )
}

export default Politicas