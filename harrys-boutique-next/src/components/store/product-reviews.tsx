'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: { name: string; profileImage?: string | null }
}

interface Props {
  productId: string
  reviews: Review[]
  ratingAverage: number
  ratingCount: number
}

export function ProductReviews({
  productId,
  reviews: initialReviews,
  ratingAverage,
  ratingCount,
}: Props) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState(initialReviews)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment }),
      })
      const data = await res.json()
      if (data.success) {
        setReviews((prev) => [data.review, ...prev])
        setComment('')
        toast.success('Reseña publicada')
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Error al publicar la reseña')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-12">
      <div className="flex border-b">
        {(['description', 'reviews'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm capitalize ${activeTab === tab ? 'border-b-2 border-black font-medium' : 'text-gray-500'}`}
          >
            {tab === 'description' ? 'Descripción' : `Reseñas (${ratingCount})`}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{review.user.name}</span>
                  <span className="text-yellow-400 text-sm">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
              </div>
            ))}

            {session && (
              <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Escribe una reseña</h3>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className={`text-2xl ${s <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Cuéntanos tu experiencia..."
                  rows={3}
                  maxLength={500}
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
                >
                  {submitting ? 'Publicando...' : 'Publicar reseña'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
