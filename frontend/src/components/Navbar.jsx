import React, { useState, useContext, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'

const Navbar = () => {
    const [visible, setVisible] = useState(false)
    const location = useLocation()
    const { setShowSearch, getCartCount, navigate, token, setToken, setCartItems } = useContext(ShopContext)

    // Cerrar menú móvil al cambiar de ruta
    useEffect(() => {
        setVisible(false)
    }, [location])

    const handleLogout = () => {
        toast.success('Desconectado correctamente')
        navigate('/login')
        setToken('')
        localStorage.removeItem('token')
        setCartItems([])
    }

    const navItems = [
        { path: '/', label: 'INICIO' },
        { path: '/collection', label: 'COLECCIONES' },
        { path: '/about', label: 'NOSOTROS' },
        { path: '/contact', label: 'CONTACTO' },
    ]

    return (
        <nav className='sticky top-0 z-40 bg-white/80 backdrop-blur-md'>
            <div className='px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20'>
                <div className='flex justify-between items-center py-4 font-medium'>
                    {/* Logo */}
                    <Link to='/' className='flex-shrink-0 z-50'>
                        <img 
                            src={assets.logo3} 
                            className='w-28 md:w-36 transition-all duration-300' 
                            alt='logo'
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <ul className='hidden sm:flex gap-8 text-sm text-gray-700'>
                        {navItems.map((item) => (
                            <NavLink 
                                key={item.path}
                                to={item.path} 
                                className={({ isActive }) => `
                                    flex flex-col items-center gap-1 transition-colors duration-300
                                    hover:text-black relative
                                    ${isActive ? 'text-black' : ''}
                                `}
                            >
                                {item.label}
                                <motion.div
                                    className='absolute -bottom-2 h-0.5 bg-black'
                                    initial={{ width: 0 }}
                                    animate={{ width: location.pathname === item.path ? '100%' : 0 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </NavLink>
                        ))}
                    </ul>

                    {/* Actions */}
                    <div className='flex gap-6 items-center z-50'>
                        <button 
                            onClick={() => setShowSearch(true)}
                            className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                        >
                            <img src={assets.search_icon} className='w-5' alt='search' />
                        </button>
                        
                        <div className='group relative'>
                            <button 
                                onClick={() => token ? null : navigate('/login')}
                                className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                            >
                                <img src={assets.profile_icon} className='w-5' alt='user' />
                            </button>
                            
                            {/* User Dropdown */}
                            {token && (
                                <div className='absolute right-0 pt-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                                    <div className='bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden min-w-[160px]'>
                                        {[
                                            { label: 'Mi cuenta', action: () => navigate('/profile') },
                                            { label: 'Mis compras', action: () => navigate('/orders') },
                                            { label: 'Desconectarse', action: handleLogout }
                                        ].map((item, index) => (
                                            <button
                                                key={index}
                                                onClick={item.action}
                                                className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link to='/cart' className='relative p-2 hover:bg-gray-100 rounded-full transition-colors'>
                            <img src={assets.cart_icon} className='w-5' alt='cart' />
                            {getCartCount() > 0 && (
                                <span className='absolute right-0 top-0 bg-black text-white w-5 h-5 rounded-full text-xs flex items-center justify-center'>
                                    {getCartCount()}
                                </span>
                            )}
                        </Link>

                        <button 
                            onClick={() => setVisible(true)}
                            className='p-2 hover:bg-gray-100 rounded-full transition-colors sm:hidden z-50'
                        >
                            <img src={assets.menu_icon} className='w-5' alt='menu' />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu con z-index más alto */}
            <AnimatePresence>
                {visible && (
                    <>
                        {/* Overlay con z-index alto */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-[100]"
                            onClick={() => setVisible(false)}
                        />
                        
                        {/* Menú con z-index más alto que el overlay */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className='fixed inset-y-0 right-0 w-[80%] max-w-sm bg-white shadow-xl z-[101]'
                        >
                            <div className='flex flex-col h-full'>
                                <div className='flex items-center justify-between p-4 border-b'>
                                    <h2 className='text-lg font-medium'>Menú</h2>
                                    <button 
                                        onClick={() => setVisible(false)}
                                        className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className='flex-1 overflow-y-auto'>
                                    {navItems.map((item) => (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setVisible(false)}
                                            className={({ isActive }) => `
                                                block px-6 py-3 text-gray-700 border-b border-gray-100
                                                ${isActive ? 'bg-gray-50 text-black' : 'hover:bg-gray-50'}
                                            `}
                                        >
                                            {item.label}
                                        </NavLink>
                                    ))}
                                    {!token && (
                                        <NavLink
                                            to='/login'
                                            onClick={() => setVisible(false)}
                                            className='block px-6 py-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50'
                                        >
                                            INICIAR SESIÓN
                                        </NavLink>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    )
}

export default Navbar 