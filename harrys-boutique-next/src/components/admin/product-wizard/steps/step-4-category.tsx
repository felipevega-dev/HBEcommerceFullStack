'use client'

import { useEffect, useState } from 'react'
import { ProductData } from '../types'
import { Tooltip } from '../components/tooltip'

interface Step4CategoryProps {
  productData: ProductData
  updateField: <K extends keyof ProductData>(field: K, value: ProductData[K]) => void
  errors?: Record<string, string>
  categories?: any[]
}

// Default category icons (fallback)
const CATEGORY_ICONS: Record<string, string> = {
  perros: '🐕',
  gatos: '🐈',
  aves: '🦜',
  otros: '🐾',
  dogs: '🐕',
  cats: '🐈',
  birds: '🦜',
  other: '🐾',
}

// Default subcategory icons (fallback)
const SUBCATEGORY_ICONS: Record<string, string> = {
  collares: '🦴',
  juguetes: '🎾',
  alimento: '🍖',
  ropa: '👕',
  accesorios: '🎒',
  piedras: '🪨',
  jaulas: '🏠',
  habitats: '🏠',
  toys: '🎾',
  food: '🍖',
  clothing: '👕',
  accessories: '🎒',
  litter: '🪨',
  cages: '🏠',
}

/**
 * Step 4: Category Selection
 * 
 * Visual category and subcategory selection with icons.
 * Features:
 * - Main category cards with pet icons
 * - Subcategory cards (shown after category selection)
 * - Visual selection feedback
 * - Automatic subcategory clearing on category change
 * - Fetches categories from API
 */
export function Step4Category({ productData, updateField, errors = {}, categories: propCategories }: Step4CategoryProps) {
  const { categoryId = '', subCategory = '' } = productData
  const [categories, setCategories] = useState<any[]>(propCategories || [])
  const [loading, setLoading] = useState(!propCategories)

  // Fetch categories from API if not provided
  useEffect(() => {
    if (!propCategories) {
      fetchCategories()
    }
  }, [propCategories])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (data.success && data.categories) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (newCategoryId: string) => {
    updateField('categoryId', newCategoryId)
    // Clear subcategory when category changes
    if (newCategoryId !== categoryId) {
      updateField('subCategory', '')
    }
  }

  const handleSubcategorySelect = (subcategoryId: string) => {
    updateField('subCategory', subcategoryId)
  }

  // Get selected category object
  const selectedCategory = categories.find(cat => cat.id === categoryId)
  const selectedSubcategories = selectedCategory?.subcategories || []

  // Get icon for category name
  const getCategoryIcon = (name: string) => {
    const lowerName = name.toLowerCase()
    return CATEGORY_ICONS[lowerName] || '🐾'
  }

  // Get icon for subcategory name
  const getSubcategoryIcon = (name: string) => {
    const lowerName = name.toLowerCase()
    return SUBCATEGORY_ICONS[lowerName] || '🎒'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            🏷️ Categoría
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Cargando categorías...
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          🏷️ Categoría
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Seleccioná el tipo de mascota y la categoría del producto
        </p>
      </div>

      {/* Main Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <span className="inline-flex items-center">
            Elegí el tipo de mascota *
            <Tooltip content="Elegí el tipo de mascota para este producto" />
          </span>
        </label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategorySelect(category.id)}
              className={`relative p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                categoryId === category.id
                  ? 'border-black bg-gray-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl">{getCategoryIcon(category.name)}</span>
                <span className="text-sm font-medium text-gray-900">{category.name}</span>
              </div>

              {/* Checkmark */}
              {categoryId === category.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {errors.categoryId && (
          <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{errors.categoryId}</span>
          </div>
        )}
      </div>

      {/* Subcategories (conditional) */}
      {categoryId && selectedSubcategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Subcategoría *
          </label>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {selectedSubcategories.map((subcategory: string) => (
              <button
                key={subcategory}
                type="button"
                onClick={() => handleSubcategorySelect(subcategory)}
                className={`relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                  subCategory === subcategory
                    ? 'border-black bg-gray-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">{getSubcategoryIcon(subcategory)}</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{subcategory}</span>
                </div>

                {/* Checkmark */}
                {subCategory === subcategory && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                  </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {errors.subCategory && (
            <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{errors.subCategory}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
