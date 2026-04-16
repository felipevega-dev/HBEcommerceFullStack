/**
 * Tests for ProductWizard container component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import ProductWizard from '../index'

// Mock the hooks
vi.mock('../hooks/use-wizard-state', () => ({
  useWizardState: vi.fn(() => ({
    currentStep: 1,
    productData: {
      images: [],
      imageOrder: [],
      name: '',
      description: '',
      price: 0,
      hasDiscount: false,
      categoryId: '',
      subCategory: '',
      sizes: [],
      colors: [],
      stock: 0,
      bestSeller: false,
      active: true,
    },
    isDirty: false,
    isSaving: false,
    updateField: vi.fn(),
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    goToStep: vi.fn(),
    resetWizard: vi.fn(),
    markClean: vi.fn(),
    setSaving: vi.fn(),
  })),
}))

vi.mock('../hooks/use-auto-save', () => ({
  useAutoSave: vi.fn(() => ({
    lastSaved: null,
    saveNow: vi.fn(),
    loadDraft: vi.fn(() => null),
    clearDraft: vi.fn(),
    isSaving: false,
    saveError: null,
  })),
}))

vi.mock('../hooks/use-validation', () => ({
  useValidation: vi.fn(() => ({
    errors: {},
    validateStep: vi.fn(() => true),
    clearErrors: vi.fn(),
    clearFieldError: vi.fn(),
    focusFirstError: vi.fn(),
    registerField: vi.fn(),
    getFieldError: vi.fn(),
    hasFieldError: vi.fn(() => false),
    hasErrors: vi.fn(() => false),
  })),
}))

describe('ProductWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders in create mode', async () => {
    render(<ProductWizard />)
    
    await waitFor(() => {
      expect(screen.getByText('Crear Producto')).toBeInTheDocument()
    })
  })

  it('renders in edit mode', async () => {
    render(<ProductWizard productId="123" />)
    
    await waitFor(() => {
      expect(screen.getByText('Editar Producto')).toBeInTheDocument()
    })
  })

  it('displays progress indicator', async () => {
    render(<ProductWizard />)
    
    await waitFor(() => {
      expect(screen.getByText('Paso 1 de 7')).toBeInTheDocument()
    })
  })

  it('displays step 1 content', async () => {
    render(<ProductWizard />)
    
    await waitFor(() => {
      expect(screen.getByText('📷 Fotos del Producto')).toBeInTheDocument()
    })
  })

  it('shows cancel button', async () => {
    render(<ProductWizard />)
    
    await waitFor(() => {
      expect(screen.getByText('Cancelar')).toBeInTheDocument()
    })
  })

  it('shows next button on step 1', async () => {
    render(<ProductWizard />)
    
    await waitFor(() => {
      expect(screen.getByText('Siguiente →')).toBeInTheDocument()
    })
  })

  it('does not show previous button on step 1', async () => {
    render(<ProductWizard />)
    
    await waitFor(() => {
      expect(screen.queryByText('← Anterior')).not.toBeInTheDocument()
    })
  })
})
