import userModel from '../models/userModel.js';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import orderModel from '../models/orderModel.js';

const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '1d'});
}

// Ruta para login de usuario

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await userModel.findOne({email});
        if(!user) {
            return res.json({success: false, message: 'Usuario no encontrado'});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(isMatch) {
            const token = createToken(user._id);
            return res.json({success: true, message: 'Login exitoso', token});
        } else {
            return res.json({success: false, message: 'Password incorrecto'});
        }

    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// Ruta para registro de usuario
const registerUser = async (req, res) => {
   try {
    const {name, email, password} = req.body;

    // Verificar si el usuario ya existe
    const exists = await userModel.findOne({email});
    if(exists) {
        return res.status(400).json({success: false, message: 'Usuario ya existe'});
    }

    // Validar email format y password
    if (!validator.isEmail(email)) {
        return res.status(400).json({success: false, message: 'Formato de email invalido'});
    }
    if (password.length < 8) {
        return res.status(400).json({success: false, message: 'Password no es lo suficientemente fuerte'});
    }

    // Encriptar password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear nuevo usuario con la estructura actualizada
    const newUser = new userModel({
        name,
        email,
        password: hashedPassword,
        cartData: {},
        billingAddresses: [], // Inicializar el array vacío de direcciones
        createdAt: Date.now(),
        updatedAt: Date.now()
    });
    
    const user = await newUser.save();

    const token = createToken(user._id);

    res.json({
        success: true,
        message: 'Usuario creado exitosamente',
        token
    });
   } catch (error) {
     console.error('Error al registrar usuario:', error);
     // Mejorar el mensaje de error para debugging
     res.status(400).json({
         success: false,
         message: error.message || 'Error al crear usuario',
         details: error.errors // Incluir detalles de validación si existen
     });
   }
}

// Ruta para admin login
const adminLogin = async (req, res) => {
    try {
        const {email, password} = req.body;
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            // Generamos el token con el email concatenado con el password
            const token = jwt.sign(
                { 
                    email: process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD 
                }, 
                process.env.JWT_SECRET
            );
            return res.json({success: true, message: 'Login exitoso', token});
        } else {
            return res.json({success: false, message: 'Credenciales invalidas'});
        }
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Obtener las últimas órdenes del usuario
        const recentOrders = await orderModel
            .find({ userId })
            .sort({ date: -1 })
            .limit(5);

        res.json({
            success: true,
            user,
            recentOrders
        });

    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener información del perfil'
        });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;
        
        // Eliminar campos que no queremos que el usuario actualice
        delete updates.password;
        delete updates.email;
        
        // Validar límite de direcciones
        if (updates.billingAddresses && updates.billingAddresses.length > 2) {
            return res.status(400).json({
                success: false,
                message: 'No se pueden guardar más de 2 direcciones'
            });
        }

        // Actualizar fecha de modificación
        updates.updatedAt = Date.now();

        const user = await userModel.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Perfil actualizado correctamente',
            user
        });

    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el perfil'
        });
    }
};

export {loginUser, registerUser, adminLogin, getUserProfile, updateUserProfile};

