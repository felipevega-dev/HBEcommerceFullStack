/**
 * Unit tests for storage key utilities
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  getProductDraftKey,
  isDraftExpired,
  clearWizardStorage,
  getAllDraftKeys,
  DRAFT_MAX_AGE_MS
} from '../storage-keys'

describe('getProductDraftKey', () => {
  it('should generate key for new product', () => {
    expect(getProductDraftKey()).toBe('product-wizard-draft-new')
    expect(getProductDraftKey(undefined)).toBe('product-wizard-draft-new')
  })

  it('should generate key for existing product', () => {
    expect(getProductDraftKey('abc123')).toBe('product-wizard-draft-abc123')
    expect(getProductDraftKey('xyz789')).toBe('product-wizard-draft-xyz789')
  })
})

describe('isDraftExpired', () => {
  it('should return false for recent timestamp', () => {
    const recentDate = new Date()
    expect(isDraftExpired(recentDate.toISOString())).toBe(false)
  })

  it('should return false for timestamp within 7 days', () => {
    const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    expect(isDraftExpired(sixDaysAgo.toISOString())).toBe(false)
  })

  it('should return true for timestamp older than 7 days', () => {
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    expect(isDraftExpired(eightDaysAgo.toISOString())).toBe(true)
  })

  it('should return true for timestamp exactly at max age', () => {
    const exactlyMaxAge = new Date(Date.now() - DRAFT_MAX_AGE_MS - 1000)
    expect(isDraftExpired(exactlyMaxAge.toISOString())).toBe(true)
  })
})

describe('clearWizardStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    // Clean up after each test
    localStorage.clear()
  })

  it('should clear specific product draft', () => {
    localStorage.setItem('product-wizard-draft-abc123', 'data')
    localStorage.setItem('product-wizard-draft-xyz789', 'data')
    localStorage.setItem('other-key', 'data')

    clearWizardStorage('abc123')

    expect(localStorage.getItem('product-wizard-draft-abc123')).toBeNull()
    expect(localStorage.getItem('product-wizard-draft-xyz789')).not.toBeNull()
    expect(localStorage.getItem('other-key')).not.toBeNull()
  })

  it('should clear all wizard data when no productId provided', () => {
    localStorage.setItem('product-wizard-draft-new', 'data')
    localStorage.setItem('product-wizard-draft-abc123', 'data')
    localStorage.setItem('product-wizard-preferences', 'data')
    localStorage.setItem('other-key', 'data')

    clearWizardStorage()

    expect(localStorage.getItem('product-wizard-draft-new')).toBeNull()
    expect(localStorage.getItem('product-wizard-draft-abc123')).toBeNull()
    expect(localStorage.getItem('product-wizard-preferences')).toBeNull()
    expect(localStorage.getItem('other-key')).not.toBeNull()
  })
})

describe('getAllDraftKeys', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should return all draft keys', () => {
    localStorage.setItem('product-wizard-draft-new', 'data')
    localStorage.setItem('product-wizard-draft-abc123', 'data')
    localStorage.setItem('product-wizard-draft-xyz789', 'data')
    localStorage.setItem('product-wizard-preferences', 'data')
    localStorage.setItem('other-key', 'data')

    const draftKeys = getAllDraftKeys()

    expect(draftKeys).toHaveLength(3)
    expect(draftKeys).toContain('product-wizard-draft-new')
    expect(draftKeys).toContain('product-wizard-draft-abc123')
    expect(draftKeys).toContain('product-wizard-draft-xyz789')
    expect(draftKeys).not.toContain('product-wizard-preferences')
    expect(draftKeys).not.toContain('other-key')
  })

  it('should return empty array when no drafts exist', () => {
    localStorage.setItem('other-key', 'data')
    
    const draftKeys = getAllDraftKeys()
    
    expect(draftKeys).toHaveLength(0)
  })
})
