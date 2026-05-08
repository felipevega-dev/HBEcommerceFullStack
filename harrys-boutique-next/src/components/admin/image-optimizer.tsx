'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'

interface ProcessedImage {
  original: string
  processed: string
  name: string
}

interface ImageOptimizerProps {
  images: (File | string)[]
  onImagesChange: (images: (File | string)[]) => void
}

type BackgroundPreset =
  | 'transparent'
  | 'white'
  | 'black'
  | 'gray'
  | 'beige'
  | 'gradient-blue'
  | 'gradient-pink'
  | 'gradient-purple'

const BACKGROUND_PRESETS: { id: BackgroundPreset; name: string; style: string }[] = [
  { id: 'transparent', name: 'Sin fondo', style: 'transparent' },
  { id: 'white', name: 'Blanco', style: '#ffffff' },
  { id: 'black', name: 'Negro', style: '#000000' },
  { id: 'gray', name: 'Gris', style: '#f3f4f6' },
  { id: 'beige', name: 'Beige', style: '#f5f5dc' },
  { id: 'gradient-blue', name: 'Azul', style: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient-pink', name: 'Rosa', style: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  {
    id: 'gradient-purple',
    name: 'Morado',
    style: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
  },
]

const STANDARD_HEIGHTS = [
  { label: '800px (Recomendado)', value: 800 },
  { label: '1000px', value: 1000 },
  { label: '1200px', value: 1200 },
  { label: '1500px', value: 1500 },
]

function dataUrlToFile(dataUrl: string, name: string) {
  const [header, payload] = dataUrl.split(',')
  const mime = header.match(/data:(.*?);base64/)?.[1] ?? 'image/jpeg'
  const binary = atob(payload)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return new File([bytes], name.replace(/\.[^.]+$/, '.jpg'), { type: mime })
}

function getImageName(image: File | string, index: number) {
  if (image instanceof File) return image.name

  const urlName = image.split('/').pop()?.split('?')[0]
  return urlName || `producto-${index + 1}.jpg`
}

export function ImageOptimizer({ images, onImagesChange }: ImageOptimizerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [background, setBackground] = useState<BackgroundPreset>('white')
  const [targetHeight, setTargetHeight] = useState(800)
  const [objectPosition, setObjectPosition] = useState({ x: 50, y: 50 })
  const [scale, setScale] = useState(1)
  const [processing, setProcessing] = useState(false)
  const [processedImages, setProcessedImages] = useState<Map<number, string>>(new Map())

  const currentImage = images[selectedIndex]

  const getImageSrc = useCallback((img: File | string) => {
    if (typeof img === 'string') return img
    return URL.createObjectURL(img)
  }, [])

  const applyBackgroundStyle = (preset: BackgroundPreset) => {
    if (preset === 'transparent') return 'transparent'
    if (preset.startsWith('gradient-')) {
      const gradientMap: Record<string, string> = {
        'gradient-blue': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-pink': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-purple': 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
      }
      return gradientMap[preset] || '#ffffff'
    }
    return preset
  }

  const processImage = useCallback(
    async (
      imgSrc: string,
      bg: BackgroundPreset,
      height: number,
      pos: { x: number; y: number },
      zoom: number,
    ): Promise<string> => {
      return new Promise((resolve) => {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) return resolve(imgSrc)

          const aspectRatio = img.width / img.height
          const width = Math.round(height * aspectRatio)
          canvas.width = width
          canvas.height = height

          if (bg !== 'transparent') {
            const isGradient = bg.startsWith('gradient-')
            if (isGradient) {
              const gradientMap: Record<string, string> = {
                'gradient-blue': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'gradient-pink': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'gradient-purple': 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
              }
              const gradient = ctx.createLinearGradient(0, 0, width, height)
              const colors = {
                'gradient-blue': ['#667eea', '#764ba2'],
                'gradient-pink': ['#f093fb', '#f5576c'],
                'gradient-purple': ['#c471f5', '#fa71cd'],
              }
              const colorPair = colors[bg as keyof typeof colors] || ['#ffffff', '#ffffff']
              gradient.addColorStop(0, colorPair[0])
              gradient.addColorStop(1, colorPair[1])
              ctx.fillStyle = gradient
            } else {
              ctx.fillStyle = bg
            }
            ctx.fillRect(0, 0, width, height)
          }

          const drawWidth = width * zoom
          const drawHeight = height * zoom
          const drawX = (width - drawWidth) * (pos.x / 100)
          const drawY = (height - drawHeight) * (pos.y / 100)

          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

          resolve(canvas.toDataURL('image/jpeg', 0.95))
        }
        img.onerror = () => resolve(imgSrc)
        img.src = imgSrc
      })
    },
    [],
  )

  const applyToCurrent = useCallback(async () => {
    if (!currentImage) return
    setProcessing(true)

    try {
      const imgSrc = getImageSrc(currentImage)
      try {
        const processed = await processImage(
          imgSrc,
          background,
          targetHeight,
          objectPosition,
          scale,
        )

        setProcessedImages((prev) => {
          const next = new Map(prev)
          next.set(selectedIndex, processed)
          return next
        })
      } finally {
        if (currentImage instanceof File) {
          URL.revokeObjectURL(imgSrc)
        }
      }
    } finally {
      setProcessing(false)
    }
  }, [
    currentImage,
    background,
    targetHeight,
    objectPosition,
    scale,
    selectedIndex,
    getImageSrc,
    processImage,
  ])

  const applyToAll = useCallback(async () => {
    setProcessing(true)

    try {
      const newProcessed = new Map<number, string>()

      for (let i = 0; i < images.length; i++) {
        const imgSrc = getImageSrc(images[i])
        try {
          const processed = await processImage(
            imgSrc,
            background,
            targetHeight,
            objectPosition,
            scale,
          )
          newProcessed.set(i, processed)
        } finally {
          if (images[i] instanceof File) {
            URL.revokeObjectURL(imgSrc)
          }
        }
      }

      setProcessedImages(newProcessed)
    } finally {
      setProcessing(false)
    }
  }, [images, background, targetHeight, objectPosition, scale, getImageSrc, processImage])

  const getDisplayUrl = useCallback(
    (index: number) => {
      const processed = processedImages.get(index)
      if (processed) return processed
      return getImageSrc(images[index])
    },
    [processedImages, images, getImageSrc],
  )

  const applyAndSave = useCallback(() => {
    const nextImages = images.map((image, i) => {
      const processed = processedImages.get(i)
      return processed ? dataUrlToFile(processed, getImageName(image, i)) : image
    })

    onImagesChange(nextImages)
  }, [processedImages, images, onImagesChange])

  const resetPosition = useCallback(() => {
    setObjectPosition({ x: 50, y: 50 })
    setScale(1)
  }, [])

  if (images.length === 0) return null

  return (
    <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Optimizador de Imágenes</h3>
          <p className="text-sm text-gray-500">Centra, ajusta y aplica fondos a tus fotos</p>
        </div>
        <div className="flex gap-2">
          {processedImages.size > 0 && (
            <button
              onClick={applyAndSave}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Guardar cambios
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div
            className="relative overflow-hidden rounded-lg border bg-gray-100"
            style={{ height: 400 }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: applyBackgroundStyle(background) }}
            >
              <div
                className="relative overflow-hidden"
                style={{
                  width: 300 * scale,
                  height: '100%',
                  maxWidth: '100%',
                }}
              >
                <Image
                  src={getDisplayUrl(selectedIndex)}
                  alt={`Imagen ${selectedIndex + 1}`}
                  fill
                  className="object-contain"
                  style={{
                    objectPosition: `${objectPosition.x}% ${objectPosition.y}%`,
                  }}
                />
              </div>
            </div>

            {processing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white">Procesando...</div>
              </div>
            )}
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`relative flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                  selectedIndex === i ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                }`}
                style={{ width: 60, height: 60 }}
              >
                <Image
                  src={getDisplayUrl(i)}
                  alt={`Miniatura ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Fondo</label>
            <div className="grid grid-cols-4 gap-2">
              {BACKGROUND_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setBackground(preset.id)}
                  className={`aspect-square rounded-lg border-2 transition-colors ${
                    background === preset.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200'
                  }`}
                  style={{
                    background:
                      preset.id === 'transparent'
                        ? 'repeating-conic-gradient(#808080 0% 25%, #ffffff 0% 50%) 50% / 10px 10px'
                        : preset.style,
                  }}
                  title={preset.name}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {BACKGROUND_PRESETS.find((p) => p.id === background)?.name}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Altura objetivo</label>
            <select
              value={targetHeight}
              onChange={(e) => setTargetHeight(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {STANDARD_HEIGHTS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Posición: X {objectPosition.x}% / Y {objectPosition.y}%
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                value={objectPosition.x}
                onChange={(e) => setObjectPosition((p) => ({ ...p, x: Number(e.target.value) }))}
                className="w-full"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={objectPosition.y}
                onChange={(e) => setObjectPosition((p) => ({ ...p, y: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Zoom: {Math.round(scale * 100)}%
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetPosition}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              Resetear posición
            </button>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <button
              onClick={applyToCurrent}
              disabled={processing}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {processing ? 'Procesando...' : 'Aplicar a esta imagen'}
            </button>
            <button
              onClick={applyToAll}
              disabled={processing}
              className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {processing ? 'Procesando...' : `Aplicar a todas (${images.length})`}
            </button>
          </div>

          {processedImages.size > 0 && (
            <p className="text-xs text-green-600 text-center">
              ✓ {processedImages.size} imagen(es) procesada(s)
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
