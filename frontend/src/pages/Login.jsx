import React, { useState, useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const {token, setToken, navigate, backendUrl} = useContext(ShopContext);
  const location = useLocation();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (currentState === 'Sign Up') {
      if (!name.trim()) {
        newErrors.name = 'El nombre es requerido';
      }
    }

    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (currentState === 'Sign Up' && password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (currentState === 'Sign Up') {
        const response = await axios.post(backendUrl + '/api/user/register', {
          name, email, password
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          toast.success('Cuenta creada exitosamente');
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(backendUrl + '/api/user/login', {
          email, password
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          toast.success('Inicio de sesión exitoso');
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error(error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Algo salió mal');
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      const from = location.state?.from || '/';
      navigate(from);
    }
  }, [token, navigate, location]);

  return (
    <div className='flex items-center justify-center min-h-[calc(100vh-200px)]'>
      <form onSubmit={onSubmitHandler} className='w-[90%] sm:max-w-md bg-white p-8 rounded-lg shadow-lg'>
        <div className='text-center mb-8'>
          <h2 className='text-3xl font-semibold mb-2'>{currentState}</h2>
          <p className='text-gray-600 text-sm'>
            {currentState === 'Login' 
              ? 'Ingresa a tu cuenta para continuar' 
              : 'Crea una cuenta para comenzar'}
          </p>
        </div>
        
        {currentState === 'Sign Up' && (
          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-medium mb-2'>
              Nombre
            </label>
            <input 
              onChange={(e) => setName(e.target.value)} 
              value={name} 
              type="text" 
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-black/10'
              }`}
              placeholder='Tu nombre' 
            />
            {errors.name && <p className='text-red-500 text-xs mt-1'>{errors.name}</p>}
          </div>
        )}

        <div className='mb-4'>
          <label className='block text-gray-700 text-sm font-medium mb-2'>
            Email
          </label>
          <input 
            onChange={(e) => setEmail(e.target.value)} 
            value={email} 
            type="email" 
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-black/10'
            }`}
            placeholder='tu@email.com' 
          />
          {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email}</p>}
        </div>

        <div className='mb-6'>
          <label className='block text-gray-700 text-sm font-medium mb-2'>
            Contraseña
          </label>
          <div className='relative'>
            <input 
              onChange={(e) => setPassword(e.target.value)} 
              value={password} 
              type={showPassword ? "text" : "password"} 
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
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
          {errors.password && <p className='text-red-500 text-xs mt-1'>{errors.password}</p>}
          {currentState === 'Sign Up' && (
            <p className='text-gray-500 text-xs mt-1'>
              La contraseña debe tener al menos 8 caracteres
            </p>
          )}
        </div>

        <div className='flex flex-col gap-4'>
          <button 
            type="submit" 
            disabled={isLoading}
            className='w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50'
          >
            {isLoading ? 'Cargando...' : currentState === 'Sign Up' ? 'Registrarse' : 'Iniciar sesión'}
          </button>

          <div className='text-center text-sm'>
            <button 
              type="button"
              onClick={() => {
                setCurrentState(currentState === 'Login' ? 'Sign Up' : 'Login');
                setErrors({});
              }}
              className='text-gray-600 hover:text-black'
            >
              {currentState === 'Login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Login;