'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import { BrandIcon } from '@/components/ui/brand-icon'

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
            className={`px-5 py-3 text-sm capitalize ${activeTab === tab ? 'border-b-2 border-[var(--color-ink)] font-medium' : 'text-[var(--color-text-muted)]'}`}
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
                  <span className="flex gap-0.5 text-[var(--color-gold)]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <BrandIcon
                        key={star}
                        name="star"
                        className={`h-4 w-4 ${star <= review.rating ? 'fill-current' : 'text-[var(--color-border)]'}`}
                      />
                    ))}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">{review.comment}</p>
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
                      className={`${s <= rating ? 'text-[var(--color-gold)]' : 'text-[var(--color-border)]'}`}
                    >
                      <BrandIcon name="star" className="h-6 w-6 fill-current" />
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
                  className="ui-field w-full py-2"
                />
                <button type="submit" disabled={submitting} className="ui-button ui-button-primary">
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
