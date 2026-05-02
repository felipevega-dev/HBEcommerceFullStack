import Link from 'next/link'
import { BrandIcon } from '@/components/ui/brand-icon'

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-16">
      <div className="mb-6 rounded-full bg-green-100 p-4 text-green-700">
        <BrandIcon name="check-circle" className="h-12 w-12" />
      </div>
      <h1 className="text-3xl font-medium mb-4">¡Pago exitoso!</h1>
      <p className="text-gray-600 mb-8">
        Tu pedido ha sido confirmado. Recibirás un email con los detalles.
      </p>
      <Link
        href="/orders"
        className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
      >
        Ver mis pedidos
      </Link>
    </div>
  )
}
