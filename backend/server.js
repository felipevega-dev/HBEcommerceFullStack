import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import chalk from 'chalk';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import uploadRouter from './routes/uploadRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import categoryRouter from './routes/categoryRoute.js';
import mercadoPagoRouter from './routes/mercadoPagoRoute.js';
import heroSlidesRouter from './routes/heroSlides.js';
import './models/productModel.js';
import './models/HeroSlide.js';

const app = express();
const port = process.env.PORT || 4000;

const initializeServer = async () => {
    console.log(chalk.cyan('\n=== Iniciando servidor ===\n'));

    try {
        // Conectar servicios
        await connectDB();
        await connectCloudinary();

        // Middlewares
        app.use(express.json({ limit: '50mb' }));
        app.use(cors());

        // Rutas
        app.use('/api/user', userRouter);
        app.use('/api/product', productRouter);
        app.use('/api/cart', cartRouter);
        app.use('/api/order', orderRouter);
        app.use('/api/upload', uploadRouter);
        app.use('/api/review', reviewRouter);
        app.use('/api/category', categoryRouter);
        app.use('/api/mercadopago', mercadoPagoRouter);
        app.use('/api/hero-slides', heroSlidesRouter);
        app.get('/', (req, res) => res.send('API running'));

        // Inicializar algunas categorías por defecto si no existen
        const CategoryModel = (await import('./models/categoryModel.js')).default;
        const defaultCategories = [
            {
                name: 'Prendas',
                subcategories: ['Polerones', 'Vestidos', 'Camisetas']
            },
            {
                name: 'Accesorios',
                subcategories: ['Collares', 'Pulseras']
            },
            {
                name: 'Arneses',
                subcategories: ['Pequeños', 'Medianos', 'Grandes']
            }
        ];

        for (const cat of defaultCategories) {
            const exists = await CategoryModel.findOne({ name: cat.name });
            if (!exists) {
                await CategoryModel.create(cat);
                console.log(chalk.green(`✓ Categoría creada: ${cat.name}`));
            }
        }

        // Iniciar servidor
        app.listen(port, () => {
            console.log('\n' + chalk.cyan('=== Estado del servidor ==='));
            console.log(chalk.green('✓') + ' Servidor ejecutándose en:' + chalk.yellow(` http://localhost:${port}`));
            console.log(chalk.cyan('\n=== Rutas disponibles ==='));
            console.log(chalk.yellow('→') + ' /api/user');
            console.log(chalk.yellow('→') + ' /api/product');
            console.log(chalk.yellow('→') + ' /api/cart');
            console.log(chalk.yellow('→') + ' /api/order');
            console.log(chalk.yellow('→') + ' /api/upload');
            console.log(chalk.yellow('→') + ' /api/review');
            console.log(chalk.yellow('→') + ' /api/category');
            console.log(chalk.yellow('→') + ' /api/mercadopago');
            console.log(chalk.yellow('→') + ' /api/hero-slides');
            console.log('\n' + chalk.green('¡Servidor listo para recibir peticiones!') + '\n');
        });

    } catch (error) {
        console.error(chalk.red('\n✗ Error al iniciar el servidor:'), error);
        process.exit(1);
    }
};

initializeServer();