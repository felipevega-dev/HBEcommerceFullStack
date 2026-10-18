import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import { GUEST_ORDER_COOKIE, hasGuestOrderAccess, verifyGuestOrderToken } from '@/lib/guest-orders'
import { OrdersList, type OrderWithItems } from '@/components/store/orders-list'
import { PaymentFeedback } from '@/components/store/payment-feedback'

export const metadata: Metadata = {
  title: "Tu pedido — Harry's Boutique",
  robots: { index: false },
}

export const dynamic = 'force-dynamic'

const ADMIN_ROLES = ['OWNER', 'ADMIN', 'MODERATOR']

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const [{ id }, { token }, session, cookieStore] = await Promise.all([
    params,
    searchParams,
    auth(),
    cookies(),
  ])

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } })
  if (!order) notFound()

  const viewer = session?.user ?? null
  const isGuestOrder = order.userId === null
  const isAdmin = viewer !== null && ADMIN_ROLES.includes(viewer.role)
  const isOwner = viewer !== null && order.userId === viewer.id
  const hasGuestAccess =
    isGuestOrder &&
    (verifyGuestOrderToken(order.id, token) ||
      hasGuestOrderAccess(cookieStore.get(GUEST_ORDER_COOKIE)?.value, order.id))

  if (!isAdmin && !isOwner && !hasGuestAccess) {
    if (!viewer && !isGuestOrder) {
      redirect(`/login?callbackUrl=${encodeURIComponent(`/orders/${order.id}`)}`)
    }
    notFound()
  }

  const serialized = serialize(order) as unknown as OrderWithItems
  const shortId = order.id.slice(-8).toUpperCase()
  const linkClass =
    'font-semibold text-[var(--color-text-primary)] underline-offset-4 hover:underline'

  return (
    <div className="py-10">
      <p className="ui-eyebrow">{isGuestOrder ? 'Compra como invitado' : 'Tu cuenta'}</p>
      <h1 className="ui-display mb-3 mt-3 text-3xl">Pedido #{shortId}</h1>
      <p className="mb-8 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
        {isGuestOrder
          ? `Enviamos la confirmación y el seguimiento a ${order.customerEmail ?? 'tu email'}. Guarda este enlace para volver a ver tu pedido.`
          : 'Aquí puedes seguir cada etapa de tu pedido.'}
      </p>
      <Suspense>
        <PaymentFeedback />
      </Suspense>
      <OrdersList orders={[serialized]} defaultExpandedId={order.id} />
      <div className="mt-8 flex flex-wrap gap-6 text-sm">
        {viewer ? (
          <Link href="/orders" className={linkClass}>
            Ver todos mis pedidos
          </Link>
        ) : (
          <Link href="/login?callbackUrl=%2Forders" className={linkClass}>
            Crear una cuenta para guardar tus pedidos
          </Link>
        )}
        <Link href="/tienda" className={linkClass}>
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
