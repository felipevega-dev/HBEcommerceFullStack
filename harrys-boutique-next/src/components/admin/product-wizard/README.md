# Product Wizard

A 7-step guided interface for creating and editing products in the admin panel. Designed for non-technical users with visual feedback, validation, and auto-save.

## Directory Structure

```
product-wizard/
├── index.tsx                 # Main ProductWizard container component
├── steps/                    # Individual step components (1-7)
│   └── index.ts             # Step exports
├── components/               # Reusable UI components
│   └── index.ts             # Component exports
├── modals/                   # Modal dialogs
│   └── index.ts             # Modal exports
├── hooks/                    # Custom React hooks
│   └── index.ts             # Hook exports
└── utils/                    # Utility functions and constants
    └── index.ts             # Utility exports
```

## Dependencies

- **@dnd-kit/core** (v6.3.1) - Core drag-and-drop functionality
- **@dnd-kit/sortable** (v10.0.0) - Sortable drag-and-drop for image reordering
- **framer-motion** (v12.38.0) - Animations and transitions

## Features

- ✅ Step-by-step navigation with progress indicator
- ✅ Auto-save to localStorage
- ✅ Drag-and-drop image upload and reordering
- ✅ Real-time validation with user-friendly error messages
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Keyboard navigation and accessibility (WCAG 2.1 AA)
- ✅ Spanish language interface

## Usage

```tsx
import ProductWizard from '@/components/admin/product-wizard';

// Create mode
<ProductWizard />

// Edit mode
<ProductWizard productId="123" initialData={productData} />
```

## Development Status

**Task 1: Setup Project Structure and Dependencies** ✅ COMPLETED

- [x] Created directory structure
- [x] Installed @dnd-kit/core and @dnd-kit/sortable
- [x] Verified framer-motion is installed
- [x] Created placeholder index files
- [x] Verified imports resolve correctly

## Next Steps

See `tasks.md` for the complete implementation plan:
- Task 2: Create Type Definitions and Utilities
- Task 3: Build Core Wizard State Management Hook
- Task 4: Build Auto-Save Hook with LocalStorage
- ...and 30 more tasks

## Documentation

- **requirements.md** - Detailed requirements and acceptance criteria
- **design.md** - Architecture, UI/UX design, and technical implementation
- **tasks.md** - Complete task breakdown with dependencies and estimates
