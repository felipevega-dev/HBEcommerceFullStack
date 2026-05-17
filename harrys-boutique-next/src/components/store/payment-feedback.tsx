'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { useCartStore } from '@/store/cart-store'

export function PaymentFeedback() {
  const searchParams = useSearchParams()
  const payment = searchParams.get('payment')
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    if (payment === 'success') {
      clearCart()
      localStorage.removeItem('checkout-progress')
      toast.success('¡Pago aprobado! Tu pedido está siendo procesado.')
    } else if (payment === 'pending') {
      toast.info('Tu pago está pendiente de confirmación. Te avisaremos por email.')
    }
  }, [clearCart, payment])

  return null
}
