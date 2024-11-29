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
        app.get('/', (req, res) => res.send('API running'));

        // Iniciar servidor
        app.listen(port, () => {
            console.log('\n' + chalk.cyan('=== Estado del servidor ==='));
            console.log(chalk.green('✓') + ' Servidor ejecutándose en:' + chalk.yellow(` http://localhost:${port}`));
            console.log(chalk.cyan('\n=== Rutas disponibles ==='));
            console.log(chalk.yellow('→') + ' /api/user');
            console.log(chalk.yellow('→') + ' /api/product');
            console.log(chalk.yellow('→') + ' /api/product/categories');
            console.log('\n' + chalk.green('¡Servidor listo para recibir peticiones!') + '\n');
        });

    } catch (error) {
        console.error(chalk.red('\n✗ Error al iniciar el servidor:'), error);
        process.exit(1);
    }
};

initializeServer();
