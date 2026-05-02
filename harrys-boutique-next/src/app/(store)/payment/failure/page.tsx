import Link from 'next/link'
import { BrandIcon } from '@/components/ui/brand-icon'

export default function PaymentFailurePage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-16">
      <div className="mb-6 rounded-full bg-red-100 p-4 text-red-700">
        <BrandIcon name="x-circle" className="h-12 w-12" />
      </div>
      <h1 className="text-3xl font-medium mb-4">Pago fallido</h1>
      <p className="text-gray-600 mb-8">
        Hubo un problema con tu pago. Por favor intenta nuevamente.
      </p>
      <Link
        href="/checkout"
        className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
      >
        Intentar de nuevo
      </Link>
    </div>
  )
}
