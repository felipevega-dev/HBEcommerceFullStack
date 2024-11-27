import mongoose from 'mongoose';
import chalk from 'chalk';

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log(chalk.green('✓') + ' MongoDB conectado exitosamente');
        });

        mongoose.connection.on('error', (err) => {
            console.error(chalk.red('✗') + ' Error de MongoDB:', err);
        });
        
        await mongoose.connect(`${process.env.MONGO_URI}/Harrysboutique`);
    } catch (error) {
        console.error(chalk.red('✗') + ' Error al conectar MongoDB:', error);
        process.exit(1);
    }
}

export default connectDB;
