import mongoose from 'mongoose'
import logger from './logger.js'

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB conectado exitosamente')
    })

    mongoose.connection.on('error', (err) => {
      logger.error('Error de MongoDB', { error: err.message })
    })

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB desconectado')
    })

    await mongoose.connect(process.env.MONGO_URI, { dbName: 'Harrysboutique' })
  } catch (error) {
    logger.error('Error al conectar MongoDB', { error: error.message })
    process.exit(1)
  }
}

export default connectDB
