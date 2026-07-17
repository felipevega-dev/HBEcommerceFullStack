import { Navbar } from '@/components/store/navbar'
import { Footer } from '@/components/store/footer'
import { CartDrawer } from '@/components/store/cart-drawer'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="store-neutral-shell flex min-h-screen flex-col bg-[#f6f6f3]">
      <Navbar />
      <main className="ui-store-main flex-grow">{children}</main>
      <Footer />
      <CartDrawer />
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />
    </div>
  )
}
