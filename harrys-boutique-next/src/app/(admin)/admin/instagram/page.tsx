import type { Metadata } from 'next'
import { InstagramManager } from '@/components/admin/instagram-manager'
import { getInstagramAdminSnapshot } from '@/lib/instagram-automation'

export const metadata: Metadata = { title: "Instagram Automation - Admin Harry's Boutique" }
export const dynamic = 'force-dynamic'

export default async function AdminInstagramPage() {
  const snapshot = await getInstagramAdminSnapshot()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Instagram Automation</h1>
        <p className="text-sm text-gray-600">
          Configura la hora diaria, genera borradores desde productos y controla la cola antes de
          publicar.
        </p>
      </div>

      <InstagramManager
        settings={snapshot.settings}
        posts={snapshot.posts}
        eligibleProducts={snapshot.eligibleProducts}
      />
    </div>
  )
}
