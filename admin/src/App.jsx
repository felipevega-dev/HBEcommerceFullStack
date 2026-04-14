import axios from 'axios'
import React, { Suspense, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import Login from './components/Login.jsx'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import 'react-toastify/dist/ReactToastify.css'

const Add = React.lazy(() => import('./pages/Add.jsx'))
const Dashboard = React.lazy(() => import('./pages/Dashboard.jsx'))
const EditProduct = React.lazy(() => import('./pages/EditProduct.jsx'))
const Hero = React.lazy(() => import('./pages/Hero.jsx'))
const List = React.lazy(() => import('./pages/List.jsx'))
const Orders = React.lazy(() => import('./pages/Orders.jsx'))
const Settings = React.lazy(() => import('./pages/Settings.jsx'))

export const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
export const currency = '$'

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '')

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
      return
    }
    localStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          setToken('')
          toast.error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.')
        }
        return Promise.reject(error)
      },
    )
    return () => {
      axios.interceptors.response.eject(interceptor)
    }
  }, [setToken])

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
      {token === '' ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <hr />
          <div className="flex w-full">
            <Sidebar />
            <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-base text-gray-800">
              <Suspense fallback={<div className="p-6 text-gray-400">Cargando...</div>}>
                <Routes>
                  <Route path="/" element={<Dashboard token={token} />} />
                  <Route path="/add" element={<Add token={token} />} />
                  <Route path="/list" element={<List token={token} />} />
                  <Route path="/orders" element={<Orders token={token} />} />
                  <Route path="/hero" element={<Hero token={token} />} />
                  <Route path="/edit/:id" element={<EditProduct token={token} />} />
                  <Route path="/settings" element={<Settings token={token} />} />
                </Routes>
              </Suspense>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default App
