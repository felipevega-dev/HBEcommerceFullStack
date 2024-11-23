import userModel from '../models/userModel.js';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

    // Crear nuevo usuario
    const newUser = await userModel({name, email, password: hashedPassword});
    
    const user = await newUser.save();

    const token = createToken(user._id);

    res.json({success: true, message: 'Usuario creado exitosamente', token});
   } catch (error) {
     console.log(error);
     res.json({success: false, message: error.message});
   }
}

// Ruta para admin login
const adminLogin = async (req, res) => {
    
}

export {loginUser, registerUser, adminLogin};

