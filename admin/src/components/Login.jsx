import React, { useState } from 'react'
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Login = ({setToken}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
            const response = await axios.post(backendUrl + '/api/user/admin', {
                email, 
                password
            });
            
            console.log('Respuesta login:', response.data);

            if (response.data.success && response.data.token) {
                const token = response.data.token.trim();
                console.log('Token guardado:', token);
                setToken(token);
                toast.success('Login exitoso');
            } else {
                toast.error(response.data.message || 'Error en el login');
            }
        } catch (error) {
            console.log('Error completo:', error);
            toast.error(error.response?.data?.message || error.message);
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center w-full'>
            <div className='bg-white shadow-md rounded-lg px-8 py-6 max-w-md'>
                <h1 className='text-2xl font-bold mb-4'>Admin Panel</h1>
                <form onSubmit={onSubmitHandler}>
                    <div className='mb-4 min-w-72'>
                        <p className='text-sm text-gray-700 font-medium mb-2'>Email</p>
                        <input 
                            onChange={(e) => setEmail(e.target.value)} 
                            value={email}
                            className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' 
                            type="email" 
                            placeholder='your@email.com' 
                            required
                        />
                    </div>
                    <div className='mb-4 min-w-72'>
                        <p className='text-sm text-gray-700 font-medium mb-2'>Password</p>
                        <input 
                            onChange={(e) => setPassword(e.target.value)} 
                            value={password}
                            className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' 
                            type="password" 
                            placeholder='********' 
                            required
                        />
                    </div>
                    <button 
                        className='mt-2 w-full py-2 px-4 rounded-md text-white bg-black' 
                        type='submit'
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login
