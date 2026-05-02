'use client'

import { useCallback } from 'react'
import { ProductData } from '../types'
import { Tooltip } from '../components/tooltip'
import { validateImageFile } from '../utils/validation-rules'
import { BrandIcon } from '@/components/ui/brand-icon'

interface Step1PhotosProps {
  productData: ProductData
  updateField: <K extends keyof ProductData>(field: K, value: ProductData[K]) => void
  errors?: Record<string, string>
}

/**
 * Step 1: Photo Upload
 * 
 * Allows users to upload up to 4 product images with drag-and-drop support.
 * Features:
 * - Drag and drop zone
 * - Image preview thumbnails
 * - Delete images
 * - First image is marked as "Principal"
 * - Validates file type and size
 */
export function Step1Photos({ productData, updateField, errors = {} }: Step1PhotosProps) {
  const images = productData.images || []
  const maxImages = 4

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return

    const newFiles: File[] = []
    const fileErrors: string[] = []

    // Validate each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const validation = validateImageFile(file)
      
      if (validation.valid) {
        newFiles.push(file)
      } else {
        fileErrors.push(validation.errors[0]?.message || 'Error al validar imagen')
      }
    }

    if (fileErrors.length > 0) {
      alert(fileErrors.join('\n'))
    }

    if (newFiles.length > 0) {
      const currentImages = images as (string[] | File[]) | undefined
      const existing = currentImages && Array.isArray(currentImages) ? currentImages : []
      const totalImages = existing.length + newFiles.length

      if (totalImages > maxImages) {
        alert(`Solo podés subir hasta ${maxImages} imágenes. Seleccionaste ${totalImages}.`)
        return
      }

      if (existing.length === 0 || typeof existing[0] === 'object') {
        updateField('images', [...(existing as File[]), ...newFiles])
      } else {
        updateField('images', [...(existing as string[]), ...newFiles.map(f => f.name)])
      }
    }
  }, [images, updateField])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }, [handleFileSelect])

  const handleDeleteImage = useCallback((index: number) => {
    const currentImages = images as (string[] | File[]) | undefined
    const existing = currentImages && Array.isArray(currentImages) ? currentImages : []
    if (existing.length === 0 || typeof existing[0] === 'object') {
      updateField('images', (existing as File[]).filter((_, i) => i !== index))
    } else {
      updateField('images', (existing as string[]).filter((_, i) => i !== index))
    }
  }, [images, updateField])

  const getImageUrl = (image: File | string): string => {
    if (typeof image === 'string') {
      return image
    }
    return URL.createObjectURL(image)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <BrandIcon name="camera" className="mr-2 h-5 w-5" />
          Fotos del Producto
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Subí hasta 4 imágenes de tu producto
        </p>
      </div>

      {/* Drop Zone */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors cursor-pointer bg-gray-50"
        >
          <input
            type="file"
            id="image-upload"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <svg
                className="w-12 h-12 text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-base font-medium text-gray-700 mb-1">
                Arrastrá tus fotos aquí o hacé click para seleccionar
              </p>
              <p className="text-sm text-gray-500">
                Hasta {maxImages} imágenes (JPG, PNG, WEBP) - Máximo 5MB cada una
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              Imágenes cargadas ({images.length}/{maxImages})
            </h3>
            <Tooltip content="La primera foto será la imagen principal del producto" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                  <img
                    src={getImageUrl(image)}
                    alt={`Producto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDeleteImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                  aria-label="Eliminar imagen"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Principal Badge */}
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
                    Principal
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Error */}
      {errors.images && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{errors.images}</span>
        </div>
      )}
    </div>
  )
}
