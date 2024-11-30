import React from 'react'
import { motion } from 'framer-motion'

const Delivery = () => {
  const deliveryMethods = [
    {
      name: 'Bluexpress',
      logo: '/bluexpress-logo.png', // Necesitarías agregar este logo a tus assets
      description: 'Servicio express para entregas rápidas en todo Chile',
      time: '2-3 días hábiles',
      areas: 'Disponible en todo Chile',
      tracking: true
    },
    {
      name: 'Correos de Chile',
      logo: '/correoschile-logo.png', // Necesitarías agregar este logo a tus assets
      description: 'Servicio estándar con amplia cobertura nacional',
      time: '3-5 días hábiles',
      areas: 'Disponible en todo Chile',
      tracking: true
    }
  ]

  return (
    <motion.div 
      className="max-w-4xl mx-auto px-6 py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-medium">Información de Envíos</h1>
          <p className="text-gray-600">
            En Harry's Boutique nos aseguramos de que tu pedido llegue de manera segura y rápida
          </p>
        </div>

        {/* Métodos de envío */}
        <div className="space-y-6">
          <h2 className="text-xl font-medium">Nuestros Métodos de Envío</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {deliveryMethods.map((method) => (
              <motion.div
                key={method.name}
                className="border rounded-lg p-6 space-y-4"
                whileHover={{ y: -5 }}
                transition={{ type: "tween" }}
              >
                <h3 className="text-lg font-medium">{method.name}</h3>
                <p className="text-gray-600 text-sm">{method.description}</p>
                <div className="space-y-2 text-sm">
                  <p>⏱ Tiempo estimado: {method.time}</p>
                  <p>📍 Cobertura: {method.areas}</p>
                  {method.tracking && (
                    <p>✓ Seguimiento en línea disponible</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Información adicional */}
        <div className="space-y-6">
          <h2 className="text-xl font-medium">Información Importante</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-medium mb-2">Tiempos de Procesamiento</h3>
              <p className="text-gray-600 text-sm">
                Tu pedido será procesado y despachado dentro de las siguientes 24-48 horas hábiles después de recibir la confirmación de pago.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-medium mb-2">Seguimiento de Pedidos</h3>
              <p className="text-gray-600 text-sm">
                Una vez que tu pedido sea despachado, recibirás un correo electrónico con el número de seguimiento para que puedas rastrear tu envío.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-medium mb-2">Costos de Envío</h3>
              <p className="text-gray-600 text-sm">
                Los costos de envío se calculan automáticamente en el checkout según tu ubicación y el método de envío seleccionado. Para compras superiores a $30.000, el envío es gratuito.
              </p>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-black text-white p-8 rounded-lg text-center space-y-4">
          <h2 className="text-xl font-medium">¿Necesitas ayuda con tu envío?</h2>
          <p className="text-gray-300">
            Nuestro equipo de atención al cliente está disponible para ayudarte
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="mailto:harrysboutique.cl@gmail.com"
              className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
            >
              Contáctanos
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Delivery