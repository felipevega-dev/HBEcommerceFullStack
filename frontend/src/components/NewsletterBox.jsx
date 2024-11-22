import React from 'react'

const NewsletterBox = () => {

    const onSubmitHandler = (event) => {
        event.preventDefault()
    }

  return (
    <div className='text-center'>
        <p className='text-2xl font-medium text-gray-800'>Suscribete y obtén un 10% de descuento en tu primera compra</p>
        <p className='text-gray-400 mt-3'>Recibe las ultimas noticias y ofertas directamente en tu correo electronico</p>
        <form onSubmit={onSubmitHandler} className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3'>
            <input className='w-full sm:flex-1 outline-none' type='email' placeholder='Ingresa tu correo electronico' />
            <button type='submit' className='bg-black text-white text-xs px-10 py-4'>Suscribete</button>
        </form>
    </div>
  )
}

export default NewsletterBox