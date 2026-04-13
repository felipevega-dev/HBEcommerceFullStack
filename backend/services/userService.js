import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import userModel from '../models/userModel.js'
import orderModel from '../models/orderModel.js'
import { ValidationError, AuthenticationError, NotFoundError } from '../middleware/errorHandler.js'

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' })

export const loginUserService = async (email, password) => {
  const user = await userModel.findOne({ email })
  if (!user) throw new AuthenticationError('Credenciales inválidas')

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw new AuthenticationError('Credenciales inválidas')

  const token = createToken(user._id)
  return { token }
}

export const registerUserService = async (name, email, password) => {
  if (!validator.isEmail(email)) throw new ValidationError('Formato de email inválido')
  if (password.length < 8)
    throw new ValidationError('La contraseña debe tener al menos 8 caracteres')

  const exists = await userModel.findOne({ email })
  if (exists) throw new ValidationError('El usuario ya existe')

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  const newUser = new userModel({
    name,
    email,
    password: hashedPassword,
    cartData: {},
    billingAddresses: [],
  })

  const user = await newUser.save()
  const token = createToken(user._id)
  return { token }
}

export const getUserProfileService = async (userId) => {
  const user = await userModel.findById(userId).select('-password')
  if (!user) throw new NotFoundError('Usuario no encontrado')

  const recentOrders = await orderModel.find({ userId }).sort({ date: -1 }).limit(5)
  return { user, recentOrders }
}

export const updateUserProfileService = async (userId, updates) => {
  delete updates.password
  delete updates.email

  if (updates.billingAddresses && updates.billingAddresses.length > 2) {
    throw new ValidationError('No se pueden guardar más de 2 direcciones')
  }

  updates.updatedAt = Date.now()

  const user = await userModel
    .findByIdAndUpdate(userId, { $set: updates }, { new: true })
    .select('-password')
  if (!user) throw new NotFoundError('Usuario no encontrado')

  return { user }
}
