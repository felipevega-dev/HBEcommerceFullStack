import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import chalk from 'chalk'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import uploadRouter from './routes/uploadRoute.js'
import reviewRouter from './routes/reviewRoute.js'
import categoryRouter from './routes/categoryRoute.js'
import mercadoPagoRouter from './routes/mercadoPagoRoute.js'
import heroSlidesRouter from './routes/heroSlides.js'
import './models/productModel.js'
import './models/HeroSlide.js'

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
    console.warn(
      chalk.yellow(
        `Variables de entorno faltantes: ${missing.join(', ')}. El servidor puede no iniciar correctamente.`,
      ),
    )
  }
}

const seedDefaultCategories = async () => {
  const CategoryModel = (await import('./models/categoryModel.js')).default
  const defaultCategories = [
    {
      name: 'Prendas',
      subcategories: ['Polerones', 'Vestidos', 'Camisetas'],
    },
    {
      name: 'Accesorios',
      subcategories: ['Collares', 'Pulseras'],
    },
    {
      name: 'Arneses',
      subcategories: ['Pequenos', 'Medianos', 'Grandes'],
    },
  ]

  for (const category of defaultCategories) {
    const exists = await CategoryModel.findOne({ name: category.name })
    if (!exists) {
      await CategoryModel.create(category)
      console.log(chalk.green(`Categoria creada: ${category.name}`))
    }
  }
}

const initializeServer = async () => {
  console.log(chalk.cyan('\n=== Iniciando servidor ===\n'))

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

    app.use('/api/user', userRouter)
    app.use('/api/product', productRouter)
    app.use('/api/cart', cartRouter)
    app.use('/api/order', orderRouter)
    app.use('/api/upload', uploadRouter)
    app.use('/api/review', reviewRouter)
    app.use('/api/category', categoryRouter)
    app.use('/api/mercadopago', mercadoPagoRouter)
    app.use('/api/hero-slides', heroSlidesRouter)
    app.get('/', (_req, res) => res.send('API running'))

    await seedDefaultCategories()

    app.listen(port, () => {
      console.log(`\n${chalk.cyan('=== Estado del servidor ===')}`)
      console.log(
        `${chalk.green('OK')} Servidor ejecutandose en:${chalk.yellow(` http://localhost:${port}`)}`,
      )
      console.log(chalk.cyan('\n=== Rutas disponibles ==='))
      console.log(chalk.yellow('->') + ' /api/user')
      console.log(chalk.yellow('->') + ' /api/product')
      console.log(chalk.yellow('->') + ' /api/cart')
      console.log(chalk.yellow('->') + ' /api/order')
      console.log(chalk.yellow('->') + ' /api/upload')
      console.log(chalk.yellow('->') + ' /api/review')
      console.log(chalk.yellow('->') + ' /api/category')
      console.log(chalk.yellow('->') + ' /api/mercadopago')
      console.log(chalk.yellow('->') + ' /api/hero-slides')
      console.log(`\n${chalk.green('Servidor listo para recibir peticiones.')}\n`)
    })
  } catch (error) {
    console.error(chalk.red('\nError al iniciar el servidor:'), error)
    process.exit(1)
  }
}

initializeServer()
