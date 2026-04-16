/**
 * Integration tests for wizard step components
 * 
 * These tests verify that all step components can be rendered
 * and integrate correctly with the wizard state.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Step1Photos,
  Step2BasicInfo,
  Step3Pricing,
  Step4Category,
  Step5SizesColors,
  Step6Options,
  Step7Review,
} from '../index'
import type { ProductData } from '../../types'

// Mock product data for testing
const mockProductData: ProductData = {
  images: [],
  imageOrder: [],
  name: 'Test Product',
  description: 'Test description for the product',
  price: 2500,
  hasDiscount: false,
  categoryId: 'dogs',
  subCategory: 'collars',
  sizes: ['M', 'L'],
  colors: ['black', 'red'],
  stock: 10,
  bestSeller: false,
  active: true,
}

const mockUpdateField = () => {}
const mockGoToStep = () => {}

describe('Step Components Integration', () => {
  it('renders Step 1 - Photos', () => {
    render(
      <Step1Photos
        productData={mockProductData}
        updateField={mockUpdateField}
        errors={{}}
      />
    )
    expect(screen.getByText(/Fotos del Producto/i)).toBeInTheDocument()
  })

  it('renders Step 2 - Basic Info', () => {
    render(
      <Step2BasicInfo
        productData={mockProductData}
        updateField={mockUpdateField}
        errors={{}}
      />
    )
    expect(screen.getByText(/Información Básica/i)).toBeInTheDocument()
  })

  it('renders Step 3 - Pricing', () => {
    render(
      <Step3Pricing
        productData={mockProductData}
        updateField={mockUpdateField}
        errors={{}}
      />
    )
    expect(screen.getByText(/Configurá el precio de tu producto/i)).toBeInTheDocument()
  })

  it('renders Step 4 - Category', () => {
    render(
      <Step4Category
        productData={mockProductData}
        updateField={mockUpdateField}
        errors={{}}
      />
    )
    expect(screen.getByText(/Seleccioná el tipo de mascota y la categoría del producto/i)).toBeInTheDocument()
  })

  it('renders Step 5 - Sizes and Colors', () => {
    render(
      <Step5SizesColors
        productData={mockProductData}
        updateField={mockUpdateField}
        errors={{}}
      />
    )
    expect(screen.getByText(/Tallas y Colores/i)).toBeInTheDocument()
  })

  it('renders Step 6 - Options', () => {
    render(
      <Step6Options
        productData={mockProductData}
        updateField={mockUpdateField}
        errors={{}}
      />
    )
    expect(screen.getByText(/Opciones Finales/i)).toBeInTheDocument()
  })

  it('renders Step 7 - Review', () => {
    render(
      <Step7Review productData={mockProductData} goToStep={mockGoToStep} />
    )
    expect(screen.getByText(/Revisión Final/i)).toBeInTheDocument()
  })
})
