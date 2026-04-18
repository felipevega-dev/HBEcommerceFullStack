'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

interface Customer {
  id: string
  name: string
  email: string
  role: string
  tags: string[]
  segment: string
  clv: number
  orderCount: number
  lastOrderDate: string | null
  createdAt: string
}

interface Props {
  users: Customer[]
  total: number
  page: number
  limit: number
}

const SEGMENT_COLORS: Record<string, string> = {
  vip: 'bg-purple-100 text-purple-800',
  frequent: 'bg-blue-100 text-blue-800',
  regular: 'bg-gray-100 text-gray-800',
  at_risk: 'bg-red-100 text-red-800',
  new: 'bg-green-100 text-green-800',
}

const SEGMENT_LABELS: Record<string, string> = {
  vip: 'VIP',
  frequent: 'Frecuente',
  regular: 'Regular',
  at_risk: 'En riesgo',
  new: 'Nuevo',
}

export function AdminCustomerList({ users, total, page, limit }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(total / limit)
  const currentSegment = searchParams.get('segment')

  const handleFilter = (segment: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (segment) params.set('segment', segment)
    else params.delete('segment')
    router.push(`/admin/customers?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <form className="flex gap-2">
        <input
          name="search"
          placeholder="Buscar por nombre o email..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
        >
          Buscar
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFilter(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !currentSegment ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos ({total})
        </button>
        <button
          onClick={() => handleFilter('vip')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            currentSegment === 'vip' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          VIP
        </button>
        <button
          onClick={() => handleFilter('frequent')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            currentSegment === 'frequent' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Frecuentes
        </button>
        <button
          onClick={() => handleFilter('new')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            currentSegment === 'new' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Nuevos
        </button>
        <button
          onClick={() => handleFilter('at_risk')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            currentSegment === 'at_risk' ? 'bg-black text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          En riesgo
        </button>
      </div>

      <div className="text-sm text-gray-500">{total} clientes en total</div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">
                Email
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">
                Segmento
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">
                CLV
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">
                Última orden
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{user.email}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      SEGMENT_COLORS[user.segment] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {SEGMENT_LABELS[user.segment] || user.segment}
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell font-medium">
                  ${user.clv.toLocaleString('es-CL')}
                </td>
                <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                  {user.lastOrderDate
                    ? new Date(user.lastOrderDate).toLocaleDateString('es-CL')
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500">
                  No hay clientes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/customers?page=${p}`}
              className={`px-3 py-1 rounded-lg text-sm border ${p === page ? 'bg-black text-white border-black' : 'hover:bg-gray-100'}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
