'use client'

import Link from 'next/link'

interface Customer {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  _count: { orders: number }
}

interface Props {
  users: Customer[]
  total: number
  page: number
  limit: number
}

export function AdminCustomerList({ users, total, page, limit }: Props) {
  const totalPages = Math.ceil(total / limit)

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
                Órdenes
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">
                Registrado
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
                <td className="px-4 py-3 hidden sm:table-cell">{user._count.orders}</td>
                <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                  {new Date(user.createdAt).toLocaleDateString('es-CL')}
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
                <td colSpan={5} className="text-center py-12 text-gray-500">
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
