import { v2 as cloudinary } from 'cloudinary';
import chalk from 'chalk';

const connectCloudinary = async () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY
        });

        // Verificar la conexión haciendo una llamada de prueba
        await cloudinary.api.ping();
        console.log(chalk.green('✓') + ' Cloudinary conectado exitosamente');
    } catch (error) {
        console.error(chalk.red('✗') + ' Error al conectar Cloudinary:', error);
        process.exit(1);
    }
}

export default connectCloudinary;