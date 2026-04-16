# Product Wizard Hooks

This directory contains custom React hooks for the Product Wizard functionality.

## useAutoSave

The `useAutoSave` hook provides automatic saving of wizard progress to localStorage with intelligent debouncing and error handling.

### Features

- **Debounced Auto-Save**: Automatically saves 2 seconds after the last change
- **Step Navigation Triggers**: Immediately saves when navigating between steps
- **Manual Save**: Provides `saveNow()` function for explicit saves
- **Draft Management**: Load and clear drafts from localStorage
- **Error Handling**: Gracefully handles localStorage quota exceeded errors
- **Expiration**: Automatically clears drafts older than 7 days

### Usage Example

```typescript
import { useWizardState } from './use-wizard-state'
import { useAutoSave } from './use-auto-save'

function ProductWizard({ productId }: { productId?: string }) {
  const wizard = useWizardState()
  
  const autoSave = useAutoSave(
    wizard.productData,
    wizard.currentStep,
    wizard.isDirty,
    productId
  )

  // Load draft on mount
  useEffect(() => {
    const draft = autoSave.loadDraft(productId)
    if (draft) {
      // Show restore modal or automatically restore
      wizard.updateField('name', draft.data.name)
      wizard.goToStep(draft.step)
      wizard.markClean()
    }
  }, [])

  // Save before navigation
  const handleNext = () => {
    autoSave.saveNow()
    wizard.nextStep()
  }

  // Clear draft on successful save
  const handleSave = async () => {
    await saveProduct(wizard.productData)
    autoSave.clearDraft(productId)
  }

  return (
    <div>
      {/* Wizard UI */}
      
      {/* Show last saved indicator */}
      {autoSave.lastSaved && (
        <p>Progreso guardado hace {formatRelativeTime(autoSave.lastSaved)}</p>
      )}
      
      {/* Show save error if any */}
      {autoSave.saveError && (
        <div className="error">{autoSave.saveError}</div>
      )}
    </div>
  )
}
```

### API Reference

#### Parameters

- `productData: ProductData` - Current product data to save
- `currentStep: number` - Current wizard step (1-7)
- `isDirty: boolean` - Whether there are unsaved changes
- `productId?: string` - Product ID for edit mode (optional)

#### Return Value

```typescript
{
  lastSaved: Date | null          // Timestamp of last successful save
  saveNow: () => void             // Manually trigger immediate save
  loadDraft: (productId?: string) => DraftState | null  // Load draft from localStorage
  clearDraft: (productId?: string) => void              // Clear draft from localStorage
  isSaving: boolean               // Whether save is in progress
  saveError: string | null        // Error message if save failed
}
```

### Draft State Structure

Drafts are stored in localStorage with the following structure:

```typescript
{
  data: ProductData,    // Complete product data
  step: number,         // Current step (1-7)
  timestamp: string     // ISO timestamp
}
```

### LocalStorage Keys

- Create mode: `product-wizard-draft-new`
- Edit mode: `product-wizard-draft-{productId}`

### Error Handling

The hook handles two types of errors:

1. **QuotaExceededError**: When localStorage is full
   - Shows user-friendly message in Spanish
   - Suggests freeing up browser space

2. **Generic Errors**: Any other save failures
   - Shows generic error message
   - Logs error to console for debugging

### Draft Expiration

Drafts older than 7 days are automatically:
- Detected as expired when loading
- Removed from localStorage
- Returned as `null` from `loadDraft()`

### Testing

The hook includes comprehensive unit tests covering:
- Debounced auto-save behavior
- Step navigation triggers
- Manual save functionality
- Draft loading and clearing
- Error handling scenarios
- Saving state management

Run tests with:
```bash
npm test use-auto-save.test.ts
```
