'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify'

export function PaymentFeedback() {
  const searchParams = useSearchParams()
  const payment = searchParams.get('payment')

  useEffect(() => {
    if (payment === 'success') {
      toast.success('¡Pago aprobado! Tu pedido está siendo procesado.')
    } else if (payment === 'pending') {
      toast.info('Tu pago está pendiente de confirmación. Te avisaremos por email.')
    }
  }, [payment])

  return null
}
