import React, { useState } from 'react'

const Login = () => {
  const [currentState, setCurrentState] = useState('Sign Up');
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    console.log(event.target);
  }
  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
      
      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
        <p className='prata-regular text-3xl'>{currentState }</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
      </div>
      {currentState === 'Login' ? '' : <input type="text" placeholder='Nombre' className='w-full px-3 py-2 border border-b border-gray-800 ' required />}
      <input type="email" placeholder='Email' className='w-full px-3 py-2 border border-b border-gray-800 ' required />
      <input type="password" placeholder='Contraseña' className='w-full px-3 py-2 border border-b border-gray-800' required />
      <div className='flex w-full justify-between text-sm mt-[-8px]'>
        <p className='cursor-pointer'>¿Olvidaste tu contraseña?</p>
        {
          currentState === 'Login' ? 
          <p className='cursor-pointer' onClick={() => setCurrentState('Sign Up')}>Registrate</p> :
          <p className='cursor-pointer' onClick={() => setCurrentState('Login')}>Inicia sesión</p> 
        }
      </div>
      <button className=' bg-black font-light text-white px-8 py-2 mt-2'>{currentState === 'Sign Up' ? 'Registrarse' : 'Iniciar sesión'}</button>
    </form>
  )
}

export default Login