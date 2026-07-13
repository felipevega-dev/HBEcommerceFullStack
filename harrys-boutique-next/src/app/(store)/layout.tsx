import { Navbar } from '@/components/store/navbar'
import { Footer } from '@/components/store/footer'
import { CartDrawer } from '@/components/store/cart-drawer'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <Navbar />
      <main className="ui-store-main flex-grow">{children}</main>
      <Footer />
      <CartDrawer />
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />
    </div>
  )
}
