import React, { Suspense, useContext, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Footer from './components/Footer'
import LoadingSpinner from './components/LoadingSpinner'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import SearchBar from './components/SearchBar'
import { ShopContext } from './context/ShopContext'
import 'react-toastify/dist/ReactToastify.css'

// Lazy loading de paginas
const Home = React.lazy(() => import('./pages/Home'))
const Collections = React.lazy(() => import('./pages/Collections'))
const About = React.lazy(() => import('./pages/About'))
const Contact = React.lazy(() => import('./pages/Contact'))
const Product = React.lazy(() => import('./pages/Product'))
const Cart = React.lazy(() => import('./pages/Cart'))
const Login = React.lazy(() => import('./pages/Login'))
const PlaceOrder = React.lazy(() => import('./pages/PlaceOrder'))
const Orders = React.lazy(() => import('./pages/Orders'))
const Profile = React.lazy(() => import('./pages/Profile'))
const PaymentSuccess = React.lazy(() => import('./pages/PaymentSuccess'))
const PaymentFailure = React.lazy(() => import('./pages/PaymentFailure'))
const PaymentPending = React.lazy(() => import('./pages/PaymentPending'))
const Delivery = React.lazy(() => import('./pages/Delivery'))
const Politicas = React.lazy(() => import('./pages/Politicas'))

const App = () => {
  const location = useLocation()
  const { setToken } = useContext(ShopContext)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
    }
  }, [setToken])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className='min-h-screen flex flex-col'>
      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
      />

      <Navbar />
      <SearchBar />

      <main className='flex-grow px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] xl:px-[8vw] 2xl:px-[8vw]'>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/collection' element={<Collections />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/product/:productId' element={<Product />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/login' element={<Login />} />
            <Route path='/delivery' element={<Delivery />} />
            <Route path='/politicas' element={<Politicas />} />

            <Route element={<ProtectedRoute />}>
              <Route path='/place-order' element={<PlaceOrder />} />
              <Route path='/orders' element={<Orders />} />
              <Route path='/profile' element={<Profile />} />
            </Route>

            <Route path='/payment/success' element={<PaymentSuccess />} />
            <Route path='/payment/failure' element={<PaymentFailure />} />
            <Route path='/payment/pending' element={<PaymentPending />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}

export default App
