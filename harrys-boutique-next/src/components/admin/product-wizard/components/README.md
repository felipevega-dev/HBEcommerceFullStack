# Product Wizard Reusable Components

This directory contains reusable UI components used across multiple steps of the Product Wizard.

## Components

### Tooltip

A tooltip component with an info icon that displays helpful text on hover.

**Features:**
- Shows on hover with arrow pointing to icon
- Auto-hides after 5 seconds
- Fully accessible with ARIA attributes
- Responsive positioning

**Usage:**

```tsx
import { Tooltip } from './components/tooltip'

// Basic usage
<Tooltip content="Describí las características principales: material, tamaño, para qué mascota es" />

// With custom aria-label
<Tooltip 
  content="El precio que verán tus clientes en la tienda"
  ariaLabel="Ayuda sobre precio de venta"
/>

// With custom className
<Tooltip 
  content="La primera foto será la imagen principal del producto"
  className="ml-2"
/>
```

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `content` | `string` | Yes | - | The tooltip content to display |
| `className` | `string` | No | `''` | Optional CSS classes for the tooltip container |
| `ariaLabel` | `string` | No | `'Más información'` | Optional aria-label for accessibility |

---

### CharacterCounter

A character counter component for input fields that shows current/max characters and changes color when approaching the limit.

**Features:**
- Shows "X/MAX caracteres" format
- Turns amber when approaching limit (default: 90% threshold)
- Turns red when over limit
- Shows warning icon when over limit
- Fully accessible with aria-live regions

**Usage:**

```tsx
import { CharacterCounter } from './components/character-counter'

// Basic usage
<CharacterCounter current={25} max={100} />
// Displays: "25/100 caracteres"

// Approaching limit (90% or more)
<CharacterCounter current={95} max={100} />
// Displays in amber: "95/100 caracteres"

// Over limit
<CharacterCounter current={105} max={100} />
// Displays in red: "105/100 caracteres ⚠️"

// Custom warning threshold (80%)
<CharacterCounter 
  current={85} 
  max={100} 
  warningThreshold={0.8} 
/>

// With custom className
<CharacterCounter 
  current={50} 
  max={100} 
  className="mt-1"
/>
```

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `current` | `number` | Yes | - | Current character count |
| `max` | `number` | Yes | - | Maximum allowed characters |
| `className` | `string` | No | `''` | Optional CSS classes for the counter |
| `warningThreshold` | `number` | No | `0.9` | Threshold percentage to turn amber (0-1) |

**Color States:**

- **Gray** (`text-gray-400`): Normal state (below threshold)
- **Amber** (`text-amber-600`): Approaching limit (≥ threshold, ≤ max)
- **Red** (`text-red-600`): Over limit (> max)

---

## Example: Using Both Components Together

```tsx
import { Tooltip } from './components/tooltip'
import { CharacterCounter } from './components/character-counter'

function ProductNameField() {
  const [name, setName] = useState('')
  const maxLength = 100

  return (
    <div>
      <label className="flex items-center text-sm font-medium">
        Nombre del Producto *
        <Tooltip content="Elegí un nombre descriptivo que incluya el tipo de producto y para qué mascota es" />
      </label>
      
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={maxLength}
        placeholder="Ej: Collar para Perro Ajustable"
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
      />
      
      <CharacterCounter 
        current={name.length} 
        max={maxLength}
        className="mt-1"
      />
    </div>
  )
}
```

## Testing

Both components have comprehensive test coverage. Run tests with:

```bash
npm test -- components/admin/product-wizard/components/__tests__/
```

## Accessibility

Both components follow WCAG 2.1 AA guidelines:

- **Tooltip**: Uses proper ARIA attributes (`role="tooltip"`, `aria-describedby`), keyboard accessible (focus/blur)
- **CharacterCounter**: Uses `aria-live` regions to announce changes to screen readers, includes descriptive `aria-label`

## Styling

Components use Tailwind CSS classes and follow the design system defined in `globals.css`. The tooltip includes a custom fade-in animation defined in the global styles.
