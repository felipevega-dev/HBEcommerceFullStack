import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminNavbar } from '@/components/admin/navbar'
import { GlobalSearch } from '@/components/admin/global-search'

const ADMIN_ROLES = ['OWNER', 'ADMIN', 'MODERATOR']

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <AdminNavbar user={session.user} />
      <GlobalSearch />
      <div className="flex flex-col md:flex-row">
        <AdminSidebar />
        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
