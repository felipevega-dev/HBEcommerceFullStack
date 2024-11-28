import React from 'react'
import harrys_logo from '../assets/harrys_logo.png'
import { Link,NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useState, useContext } from 'react'
import { ShopContext } from '../context/ShopContext';

const Narbar = () => {
    const [visible, setVisible] = useState(false);

    const { setShowSearch, getCartCount } = useContext(ShopContext);

  return (
    <div className='flex justify-between items-center py-5 font-medium'>

        {/* logo */}
        <Link to='/'>
            <img src={harrys_logo} className='w-36' alt='logo' />
        </Link>

        <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
            <NavLink to='/' className='flex flex-col items-center gap-1'>
                <p>INICIO</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'></hr>
            </NavLink>

            <NavLink to='/collection' className='flex flex-col items-center gap-1'>
                <p>COLECCIONES</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'></hr>
            </NavLink>

            <NavLink to='/about' className='flex flex-col items-center gap-1'>
                <p>NOSOTROS</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'></hr>
            </NavLink>

            <NavLink to='/contact' className='flex flex-col items-center gap-1'>
                <p>CONTACTO</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'></hr>
            </NavLink>
        </ul>   

        <div className='flex gap-6 items-center'>
            <img onClick={() => setShowSearch(true)} src={assets.search_icon} className='w-5 cursor-pointer' alt='search' />
            <div className='group relative z-50'>
                <Link to='/login'><img src={assets.profile_icon} className='w-5 cursor-pointer' alt='user' /></Link>
                <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4'>
                    <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 shadow-lg'>
                        <p className='text-sm hover:bg-slate-200 p-1 rounded cursor-pointer'>Mi cuenta</p>
                        <p className='text-sm hover:bg-slate-200 p-1 rounded cursor-pointer'>Mis compras</p>  
                        <p className='text-sm hover:bg-slate-200 p-1 rounded cursor-pointer'>Desconectarse</p>
                    </div>
                </div>
            </div>
            <Link to='/cart' className='relative'>
                <img src={assets.cart_icon} className='w-5 min-w-5 cursor-pointer' alt='cart' />
                <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>
                    {getCartCount()}
                </p>
            </Link>
            <img onClick={() => setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt='dropdown' />
        </div>

        {/* Dropdown menu */}
        <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
            <div className='flex flex-col text-gray-700'>
                <div className='flex items-center gap-4 p-3' onClick={() => setVisible(false)}>
                    <img className='h-4 rotate-180' src={assets.dropdown_icon} alt='close' />
                    <p className='text-lg'>Back</p>
                </div>
                <NavLink onClick={() => setVisible(false)} to='/' className='p-2 pl-6 border-b border-gray-200'>INICIO</NavLink>
                <NavLink onClick={() => setVisible(false)} to='/collection' className='p-2 pl-6 border-b border-gray-200'>COLECCIONES</NavLink>
                <NavLink onClick={() => setVisible(false)} to='/about' className='p-2 pl-6 border-b border-gray-200'>NOSOTROS</NavLink>
                <NavLink onClick={() => setVisible(false)} to='/contact' className='p-2 pl-6 border-b border-gray-200'>CONTACTO</NavLink>
                <NavLink onClick={() => setVisible(false)} to='/login' className='p-2 pl-6 border-b border-gray-200'>INGRESO</NavLink>
                <NavLink onClick={() => setVisible(false)} to='/cart' className='p-2 pl-6 border-b border-gray-200'>CARRITO</NavLink>
            </div>
        </div>

        
    </div>
  )
}

export default Narbar