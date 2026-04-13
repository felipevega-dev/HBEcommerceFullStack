import jwt from 'jsonwebtoken'
import {
  loginUserService,
  registerUserService,
  getUserProfileService,
  updateUserProfileService,
} from '../services/userService.js'

// Admin login — credentials checked directly, no DB lookup needed
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ adminId: 'admin', role: 'ADMIN' }, process.env.JWT_SECRET, {
        expiresIn: '8h',
      })
      return res.json({ success: true, message: 'Login exitoso', token })
    }
    return res.status(401).json({ success: false, message: 'Credenciales inválidas' })
  } catch (error) {
    next(error)
  }
}

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const result = await loginUserService(email, password)
    res.json({ success: true, message: 'Login exitoso', ...result })
  } catch (error) {
    next(error)
  }
}

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    const result = await registerUserService(name, email, password)
    res.json({ success: true, message: 'Usuario creado exitosamente', ...result })
  } catch (error) {
    next(error)
  }
}

const getUserProfile = async (req, res, next) => {
  try {
    const result = await getUserProfileService(req.user.id)
    res.json({ success: true, ...result })
  } catch (error) {
    next(error)
  }
}

const updateUserProfile = async (req, res, next) => {
  try {
    const result = await updateUserProfileService(req.user.id, req.body)
    res.json({ success: true, message: 'Perfil actualizado correctamente', ...result })
  } catch (error) {
    next(error)
  }
}

export { loginUser, registerUser, adminLogin, getUserProfile, updateUserProfile }
