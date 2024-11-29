import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SearchBar = () => {
    const { search, setSearch, showSearch, setShowSearch } = useContext(ShopContext);
    const [visible, setVisible] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (location.pathname.includes('collection')) {
            setVisible(true);
        } else {
            setVisible(false);
            setSearch('');
        }
    }, [location, setSearch]);

    const handleClose = () => {
        setShowSearch(false);
        setSearch('');
    }

    return (
        <AnimatePresence>
            {showSearch && visible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className='border-t border-b bg-gray-50'
                >
                    <div className='container mx-auto px-4 py-4 flex items-center justify-center'>
                        <div className='relative w-full max-w-2xl'>
                            <div className='flex items-center border border-gray-300 bg-white rounded-full px-5 py-2 focus-within:ring-2 focus-within:ring-gray-200 transition-all'>
                                <input 
                                    className='flex-1 outline-none bg-transparent text-sm placeholder-gray-400'
                                    type="text"
                                    placeholder='Buscar productos...'
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <img 
                                    className='w-4 opacity-50' 
                                    src={assets.search_icon} 
                                    alt="search" 
                                />
                            </div>
                            
                            <button 
                                onClick={handleClose}
                                className='absolute -right-8 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors'
                            >
                                <img 
                                    className='w-3 opacity-50' 
                                    src={assets.cross_icon} 
                                    alt="close" 
                                />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default SearchBar