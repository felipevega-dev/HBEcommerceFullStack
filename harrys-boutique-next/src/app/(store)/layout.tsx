import { Navbar } from '@/components/store/navbar'
import { Footer } from '@/components/store/footer'
import { CartDrawer } from '@/components/store/cart-drawer'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />
    </div>
  )
}
