import React, { useState, useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {
  const [currentState, setCurrentState] = useState('Login')
  const {token, setToken, navigate, backendUrl} = useContext(ShopContext)
  const location = useLocation()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (currentState === 'Sign Up') {
      if (!name.trim()) {
        newErrors.name = 'El nombre es requerido'
      }
    }

    if (!email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido'
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (currentState === 'Sign Up' && password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (currentState === 'Sign Up') {
        const response = await axios.post(backendUrl + '/api/user/register', {
          name, email, password
        })
        if (response.data.success) {
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
          toast.success('Cuenta creada exitosamente')
        } else {
          toast.error(response.data.message)
        }
      } else {
        const response = await axios.post(backendUrl + '/api/user/login', {
          email, password
        })
        if (response.data.success) {
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
          toast.success('Inicio de sesión exitoso')
        } else {
          toast.error(response.data.message)
        }
      }
    } catch (error) {
      console.error(error)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Algo salió mal')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      const from = location.state?.from || '/'
      navigate(from)
    }
  }, [token, navigate, location])

  return (
    <motion.div 
      className='min-h-[calc(100vh-200px)] flex items-center justify-center p-4'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className='w-full max-w-md bg-white p-8 rounded-lg shadow-lg'
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <motion.div 
          className='text-center mb-8'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className='text-3xl font-semibold mb-2'>{currentState}</h2>
          <p className='text-gray-600 text-sm'>
            {currentState === 'Login' 
              ? 'Ingresa a tu cuenta para continuar' 
              : 'Crea una cuenta para comenzar'}
          </p>
        </motion.div>
        
        <form onSubmit={onSubmitHandler} className='space-y-4'>
          <AnimatePresence mode='wait'>
            {currentState === 'Sign Up' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className='space-y-1'
              >
                <label className='block text-gray-700 text-sm font-medium'>
                  Nombre
                </label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                    errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-black/10'
                  }`}
                  placeholder='Tu nombre'
                />
                {errors.name && (
                  <motion.p 
                    className='text-red-500 text-xs'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.name}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className='space-y-1'>
            <label className='block text-gray-700 text-sm font-medium'>
              Email
            </label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-black/10'
              }`}
              placeholder='tu@email.com'
            />
            {errors.email && (
              <motion.p 
                className='text-red-500 text-xs'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {errors.email}
              </motion.p>
            )}
          </div>

          <div className='space-y-1'>
            <label className='block text-gray-700 text-sm font-medium'>
              Contraseña
            </label>
            <div className='relative'>
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                  errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-black/10'
                }`}
                placeholder='********'
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <motion.p 
                className='text-red-500 text-xs'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {errors.password}
              </motion.p>
            )}
            {currentState === 'Sign Up' && (
              <p className='text-gray-500 text-xs mt-1'>
                La contraseña debe tener al menos 8 caracteres
              </p>
            )}
          </div>

          <div className='space-y-4 pt-2'>
            <motion.button 
              type="submit"
              disabled={isLoading}
              className='w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? (
                <span className='flex items-center justify-center gap-2'>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Procesando...
                </span>
              ) : currentState === 'Sign Up' ? 'Registrarse' : 'Iniciar sesión'}
            </motion.button>

            <div className='text-center'>
              <motion.button 
                type="button"
                onClick={() => {
                  setCurrentState(currentState === 'Login' ? 'Sign Up' : 'Login')
                  setErrors({})
                }}
                className='text-gray-600 hover:text-black text-sm'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {currentState === 'Login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default Login