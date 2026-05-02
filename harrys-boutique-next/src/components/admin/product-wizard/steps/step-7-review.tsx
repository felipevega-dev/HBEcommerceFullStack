'use client'

import { ProductData } from '../types'
import { formatPrice, formatPriceWithDiscount, formatList } from '../utils/format-helpers'
import { BrandIcon } from '@/components/ui/brand-icon'

interface Step7ReviewProps {
  productData: ProductData
  goToStep: (step: number) => void
}

// Category names mapping
const CATEGORY_NAMES: Record<string, string> = {
  dogs: 'Perros',
  cats: 'Gatos',
  birds: 'Aves',
  other: 'Otros',
}

// Subcategory names mapping
const SUBCATEGORY_NAMES: Record<string, string> = {
  collars: 'Collares',
  toys: 'Juguetes',
  food: 'Alimento',
  clothing: 'Ropa',
  accessories: 'Accesorios',
  litter: 'Piedras',
  cages: 'Jaulas',
  habitats: 'Hábitats',
}

// Color names mapping
const COLOR_NAMES: Record<string, string> = {
  black: 'Negro',
  white: 'Blanco',
  red: 'Rojo',
  blue: 'Azul',
  green: 'Verde',
  yellow: 'Amarillo',
  pink: 'Rosa',
  brown: 'Marrón',
  gray: 'Gris',
  orange: 'Naranja',
}

/**
 * Step 7: Review
 * 
 * Final review screen showing all product information before saving.
 * Features:
 * - Organized sections for all product data
 * - Image gallery preview
 * - Edit buttons to jump back to specific steps
 * - Formatted display of all information
 */
export function Step7Review({ productData, goToStep }: Step7ReviewProps) {
  const {
    images = [],
    name,
    description,
    price,
    hasDiscount,
    originalPrice,
    categoryId,
    subCategory,
    sizes = [],
    colors = [],
    stock,
    bestSeller,
    active,
  } = productData

  const getImageUrl = (image: File | string): string => {
    if (typeof image === 'string') {
      return image
    }
    return URL.createObjectURL(image)
  }

  const categoryName = CATEGORY_NAMES[categoryId] || categoryId
  const subcategoryName = SUBCATEGORY_NAMES[subCategory] || subCategory
  const colorNames = colors.map((c) => COLOR_NAMES[c] || c)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <BrandIcon name="check-circle" className="mr-2 h-5 w-5" />
          Revisión Final
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Verificá que toda la información sea correcta antes de guardar
        </p>
      </div>

      {/* Images Section */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <BrandIcon name="camera" className="h-5 w-5" />
            Imágenes
          </h3>
          <button
            type="button"
            onClick={() => goToStep(1)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Editar
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                <img
                  src={getImageUrl(image)}
                  alt={`Producto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Basic Information Section */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <BrandIcon name="review" className="h-5 w-5" />
            Información Básica
          </h3>
          <button
            type="button"
            onClick={() => goToStep(2)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Editar
          </button>
        </div>

        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Nombre</dt>
            <dd className="mt-1 text-base text-gray-900">{name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Descripción</dt>
            <dd className="mt-1 text-base text-gray-900">{description}</dd>
          </div>
        </dl>
      </div>

      {/* Pricing Section */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <BrandIcon name="price" className="h-5 w-5" />
            Precio
          </h3>
          <button
            type="button"
            onClick={() => goToStep(3)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Editar
          </button>
        </div>

        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Precio</dt>
            <dd className="mt-1 text-base text-gray-900">
              {hasDiscount && originalPrice ? (
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">${formatPrice(price)}</span>
                  <span className="text-lg text-gray-500 line-through">${formatPrice(originalPrice)}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded">
                    {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold">${formatPrice(price)}</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* Category Section */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <BrandIcon name="tag" className="h-5 w-5" />
            Categoría
          </h3>
          <button
            type="button"
            onClick={() => goToStep(4)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Editar
          </button>
        </div>

        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Categoría</dt>
            <dd className="mt-1 text-base text-gray-900">
              {categoryName} &gt; {subcategoryName}
            </dd>
          </div>
        </dl>
      </div>

      {/* Sizes and Colors Section */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <BrandIcon name="ruler" className="h-5 w-5" />
            Tallas y Colores
          </h3>
          <button
            type="button"
            onClick={() => goToStep(5)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Editar
          </button>
        </div>

        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Tallas</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {sizes.map((size) => (
                <span
                  key={size}
                  className="px-3 py-1 bg-gray-100 text-gray-900 text-sm font-medium rounded-lg border border-gray-200"
                >
                  {size}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Colores</dt>
            <dd className="mt-2 text-base text-gray-900">
              {formatList(colorNames)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Options Section */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <BrandIcon name="settings" className="h-5 w-5" />
            Opciones
          </h3>
          <button
            type="button"
            onClick={() => goToStep(6)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Editar
          </button>
        </div>

        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Stock</dt>
            <dd className="mt-1 text-base text-gray-900">
              {stock} {stock === 1 ? 'unidad' : 'unidades'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Estado</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {bestSeller && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-lg">
                  <BrandIcon name="star" className="mr-1 inline h-3 w-3" />
                  Más Vendido
                </span>
              )}
              {active ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-lg">
                  <BrandIcon name="check" className="mr-1 inline h-3 w-3" />
                  Activo
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-lg">
                  ○ Inactivo
                </span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* Final Note */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium">Todo listo para guardar</p>
            <p className="mt-1 text-blue-700">
              Revisá la información y hacé click en "Guardar Producto" para finalizar
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
