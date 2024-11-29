import React from 'react'
import { motion } from 'framer-motion'

const Title = ({ text1, text2 }) => {
    return (
        <motion.div 
            className='inline-flex items-center gap-3'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
        >
            <motion.p 
                className='text-gray-500 tracking-wide'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {text1}{' '}
                <span className='text-gray-900 font-medium'>
                    {text2}
                </span>
            </motion.p>
            <motion.div
                className='w-8 sm:w-12 h-[1px] sm:h-[2px] bg-gray-700'
                initial={{ width: 0 }}
                animate={{ width: 'auto' }}
                transition={{ delay: 0.4 }}
            />
        </motion.div>
    )
}

export default Title