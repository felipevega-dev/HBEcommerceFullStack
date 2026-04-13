import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import mongoSanitize from 'express-mongo-sanitize'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import logger from './config/logger.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import uploadRouter from './routes/uploadRoute.js'
import reviewRouter from './routes/reviewRoute.js'
import categoryRouter from './routes/categoryRoute.js'
import mercadoPagoRouter from './routes/mercadoPagoRoute.js'
import heroSlidesRouter from './routes/heroSlides.js'
import settingsRouter from './routes/settingsRoute.js'
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js'
import errorHandler from './middleware/errorHandler.js'
import './models/productModel.js'
import './models/HeroSlide.js'

import dns from 'dns'
dns.setDefaultResultOrder('ipv4first')

const app = express()
const port = Number(process.env.PORT || 4000)

const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'FRONTEND_URL',
  'BACKEND_URL',
  'CLOUDINARY_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_SECRET_KEY',
  'MERCADOPAGO_ACCESS_TOKEN',
]

const getAllowedOrigins = () =>
  [process.env.FRONTEND_URL, process.env.ADMIN_URL]
    .filter(Boolean)
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean)

const validateEnv = () => {
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar])
  if (missing.length > 0) {
    logger.warn(
      `Variables de entorno faltantes: ${missing.join(', ')}. El servidor puede no iniciar correctamente.`,
    )
  }
}

const seedDefaultCategories = async () => {
  const CategoryModel = (await import('./models/categoryModel.js')).default
  const defaultCategories = [
    { name: 'Prendas', subcategories: ['Polerones', 'Vestidos', 'Camisetas'] },
    { name: 'Accesorios', subcategories: ['Collares', 'Pulseras'] },
    { name: 'Arneses', subcategories: ['Pequenos', 'Medianos', 'Grandes'] },
  ]

  for (const category of defaultCategories) {
    const exists = await CategoryModel.findOne({ name: category.name })
    if (!exists) {
      await CategoryModel.create(category)
      logger.info(`Categoria creada: ${category.name}`)
    }
  }
}

const initializeServer = async () => {
  logger.info('Iniciando servidor...')

  try {
    validateEnv()
    await connectDB()
    await connectCloudinary()

    const allowedOrigins = getAllowedOrigins()

    app.use(express.json({ limit: '50mb' }))
    app.use(
      cors({
        origin(origin, callback) {
          if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            callback(null, true)
            return
          }
          callback(new Error(`Origen no permitido por CORS: ${origin}`))
        },
        credentials: true,
      }),
    )

    // Rate limiting
    app.use(generalLimiter)
    app.use('/api/user/login', authLimiter)
    app.use('/api/user/register', authLimiter)
    app.use('/api/user/admin', authLimiter)

    // NoSQL injection sanitization
    app.use(mongoSanitize())

    // Make logger available to request handlers
    app.set('logger', logger)

    app.use('/api/user', userRouter)
    app.use('/api/product', productRouter)
    app.use('/api/cart', cartRouter)
    app.use('/api/order', orderRouter)
    app.use('/api/upload', uploadRouter)
    app.use('/api/review', reviewRouter)
    app.use('/api/category', categoryRouter)
    app.use('/api/mercadopago', mercadoPagoRouter)
    app.use('/api/hero-slides', heroSlidesRouter)
    app.use('/api/settings', settingsRouter)
    app.get('/', (_req, res) => res.send('API running'))

    // Global error handler (must be last)
    app.use(errorHandler)

    await seedDefaultCategories()

    app.listen(port, () => {
      logger.info(`Servidor ejecutandose en http://localhost:${port}`)
      logger.info(
        'Rutas: /api/user /api/product /api/cart /api/order /api/upload /api/review /api/category /api/mercadopago /api/hero-slides',
      )
    })
  } catch (error) {
    logger.error('Error al iniciar el servidor', { error: error.message, stack: error.stack })
    process.exit(1)
  }
}

initializeServer()
