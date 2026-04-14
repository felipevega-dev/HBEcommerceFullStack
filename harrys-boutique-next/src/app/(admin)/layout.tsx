import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminNavbar } from '@/components/admin/navbar'

const ADMIN_ROLES = ['OWNER', 'ADMIN', 'MODERATOR']

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <AdminNavbar user={session.user} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
