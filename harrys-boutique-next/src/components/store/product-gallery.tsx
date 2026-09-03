'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [current, setCurrent] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const imgRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current || zoom === 1) return
    const rect = imgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin({ x, y })
  }

  const handleMouseLeave = () => {
    setOrigin({ x: 50, y: 50 })
  }

  return (
    <div className="flex-1 flex flex-col-reverse lg:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:w-20">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`relative flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all ${
              i === current
                ? 'border-[var(--color-gold)]'
                : 'border-transparent hover:border-[var(--color-dashed)]'
            }`}
          >
            <Image
              src={img}
              alt={`${name} ${i + 1}`}
              fill
              sizes="(max-width: 768px) 80px, 100px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="flex-1 relative">
        <div
          ref={imgRef}
          className="relative aspect-[19/20] cursor-zoom-in overflow-hidden rounded-xl bg-[var(--color-panel-soft)]"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {images[current] && (
            <div
              className="w-full h-full transition-transform duration-100"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: `${origin.x}% ${origin.y}%`,
              }}
            >
              <Image
                src={images[current]}
                alt={name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                className="object-contain"
                priority
              />
            </div>
          )}
        </div>

        {/* Zoom controls */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.5))}
            className="rounded-full bg-[var(--color-surface)]/80 p-2 shadow-lg backdrop-blur-sm transition-colors hover:bg-[var(--color-surface)]"
            title="Acercar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
            className="rounded-full bg-[var(--color-surface)]/80 p-2 shadow-lg backdrop-blur-sm transition-colors hover:bg-[var(--color-surface)]"
            title="Alejar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
