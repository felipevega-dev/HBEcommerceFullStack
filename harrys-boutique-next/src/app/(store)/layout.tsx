import { Navbar } from '@/components/store/navbar'
import { Footer } from '@/components/store/footer'
import { CartDrawer } from '@/components/store/cart-drawer'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">{children}</main>
      <Footer />
      <CartDrawer />
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />
    </div>
  )
}
