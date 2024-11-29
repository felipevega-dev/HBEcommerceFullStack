import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'

const ProtectedRoute = () => {
  const { token } = useContext(ShopContext)
  const location = useLocation()
  const storedToken = localStorage.getItem('token')
  
  if (!token && !storedToken) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}

export default ProtectedRoute 