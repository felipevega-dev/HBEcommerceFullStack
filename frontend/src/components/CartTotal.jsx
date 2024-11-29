import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { motion } from 'framer-motion'

const CartTotal = () => {
    const { getCartAmount, currency, delivery_fee } = useContext(ShopContext)
    const subtotal = getCartAmount()
    const total = subtotal === 0 ? 0 : subtotal + delivery_fee

    return (
        <motion.div 
            className='w-full bg-gray-50 p-6 rounded-lg'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h2 className='text-xl font-medium mb-4'>
                Resumen del Pedido
            </h2>

            <div className='space-y-3 text-sm'>
                <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Subtotal</span>
                    <span className='font-medium'>
                        {currency} {subtotal.toLocaleString('es-CL')} CLP
                    </span>
                </div>

                <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Envío</span>
                    <span className='font-medium'>
                        {currency} {delivery_fee.toLocaleString('es-CL')} CLP
                    </span>
                </div>

                <div className='h-px bg-gray-200 my-2'></div>

                <div className='flex justify-between items-center text-base font-medium'>
                    <span>Total</span>
                    <motion.span
                        key={total}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className='text-lg'
                    >
                        {currency} {total.toLocaleString('es-CL')} CLP
                    </motion.span>
                </div>

                {subtotal > 0 && (
                    <p className='text-xs text-gray-500 mt-4'>
                        * Los precios incluyen IVA
                    </p>
                )}
            </div>
        </motion.div>
    )
}

export default CartTotal