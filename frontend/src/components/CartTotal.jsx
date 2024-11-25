import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from './Title';

const CartTotal = () => {
    const { getCartAmount, currency, delivery_fee } = useContext(ShopContext);
  return (
    <div className='w-full'>
        <div className='text-2xl'>
            <Title text1="TOTAL DEL" text2={'CARRITO'}/>
        </div>

        <div className='flex flex-col gap-2 mt-2 text-sm'>
            <div className='flex justify-between'>
                <p>Subtotal</p>
                <p>{currency} {getCartAmount()} CLP</p>
            </div>
            <hr />
            <div className='flex justify-between'>
                <p>Envío</p>
                <p>{currency} {delivery_fee} CLP</p>
            </div>
            <hr />
            <div className='flex justify-between'>
                <p>Total</p>
                <p>{currency} {getCartAmount()=== 0 ? 0 : getCartAmount() + delivery_fee} CLP</p>
            </div>
        </div>
    </div>
  )
}

export default CartTotal