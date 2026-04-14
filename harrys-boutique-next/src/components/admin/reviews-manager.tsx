'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

interface Review {
  id: string
  rating: number
  comment: string
  approved: boolean
  createdAt: string
  user: { name: string; email: string }
  product: { id: string; name: string }
}

interface Props {
  reviews: Review[]
  total: number
  page: number
  limit: number
  currentStatus?: string
}

const STARS = [1, 2, 3, 4, 5]

export function ReviewsManager({ reviews, total, page, limit, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const totalPages = Math.ceil(total / limit)

  const handleApprove = async (id: string, approved: boolean) => {
    setLoading(id)
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(approved ? 'Reseña aprobada' : 'Reseña rechazada')
        router.refresh()
      } else {
        toast.error(data.message ?? 'Error al actualizar')
      }
    } catch {
      toast.error('Error al actualizar la reseña')
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta reseña?')) return
    setLoading(id)
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Reseña eliminada')
        router.refresh()
      } else {
        toast.error(data.message ?? 'Error al eliminar')
      }
    } catch {
      toast.error('Error al eliminar la reseña')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'Todas', value: undefined },
          { label: 'Aprobadas', value: 'approved' },
          { label: 'Pendientes', value: 'pending' },
        ].map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/admin/reviews?status=${tab.value}` : '/admin/reviews'}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              currentStatus === tab.value || (!currentStatus && !tab.value)
                ? 'bg-black text-white border-black'
                : 'hover:bg-gray-50 border-gray-200'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <p className="text-sm text-gray-500">
        {total} reseña{total !== 1 ? 's' : ''}
      </p>

      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl border p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{review.user.name}</span>
                  <span className="text-xs text-gray-400">{review.user.email}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      review.approved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {review.approved ? 'Aprobada' : 'Pendiente'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {STARS.map((s) => (
                    <svg
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-xs text-gray-400 ml-1">
                    {new Date(review.createdAt).toLocaleDateString('es-CL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Producto:{' '}
                  <Link
                    href={`/product/${review.product.id}`}
                    className="hover:underline text-blue-600"
                    target="_blank"
                  >
                    {review.product.name}
                  </Link>
                </p>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {!review.approved ? (
                  <button
                    onClick={() => handleApprove(review.id, true)}
                    disabled={loading === review.id}
                    className="px-3 py-1.5 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    Aprobar
                  </button>
                ) : (
                  <button
                    onClick={() => handleApprove(review.id, false)}
                    disabled={loading === review.id}
                    className="px-3 py-1.5 text-xs border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 disabled:opacity-50 transition-colors"
                  >
                    Rechazar
                  </button>
                )}
                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={loading === review.id}
                  className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 italic">
              &ldquo;{review.comment}&rdquo;
            </p>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
            No hay reseñas{' '}
            {currentStatus === 'pending'
              ? 'pendientes'
              : currentStatus === 'approved'
                ? 'aprobadas'
                : ''}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/reviews?page=${p}${currentStatus ? `&status=${currentStatus}` : ''}`}
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
