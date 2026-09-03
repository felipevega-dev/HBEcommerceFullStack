import type { OrderWithItems } from '@/components/store/orders-list'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import { OrdersList } from '@/components/store/orders-list'
import { PaymentFeedback } from '@/components/store/payment-feedback'

export const metadata: Metadata = {
  title: "Mis Pedidos — Harry's Boutique",
  robots: { index: false },
}

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/orders')

  const raw = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const orders = serialize(raw) as unknown as OrderWithItems[]

  return (
    <div className="py-10">
      <p className="ui-eyebrow">Tu cuenta</p>
      <h1 className="ui-display mb-8 mt-3 text-3xl">Mis Pedidos</h1>
      <Suspense>
        <PaymentFeedback />
      </Suspense>
      <OrdersList orders={orders} />
    </div>
  )
}
