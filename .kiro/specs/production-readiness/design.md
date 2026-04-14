# Design Document: Production Readiness

## Overview

This document describes the technical design for closing the five production-readiness gaps in Harry's Boutique Next.js application. The changes are surgical — each gap maps to a small, well-scoped modification of an existing file or the addition of a single new component. No new infrastructure is required.

The five areas are:

1. **Order confirmation email** — fire `sendEmail` from the MercadoPago webhook after a payment is approved.
2. **Order status update email** — fire `sendEmail` from the order PUT handler after an admin changes status.
3. **Guest cart merge** — on login, POST the localStorage cart to a new `/api/cart/merge` endpoint and sync the store.
4. **Search input with debounce** — add a `SearchInput` client component to the collection page that updates `?search=` after 300 ms.
5. **Wishlist button state** — extend `ProductCard` with an optional `WishlistButton` that reflects and toggles the user's wishlist.

---

## Architecture

The application is a Next.js 16 App Router project backed by PostgreSQL via Prisma. Authentication is handled by NextAuth v5. Client state is managed with Zustand (cart) and React Query (server data). Email is sent via Resend using `@react-email/components` templates.

All five changes operate within the existing architecture:

```
Browser (React / Zustand)
        │
        ▼
Next.js App Router (Server Components + API Routes)
        │
        ├── Prisma ORM ──► PostgreSQL
        ├── Resend SDK ──► Email delivery
        └── MercadoPago SDK ──► Payment events
```

No new external services, no schema migrations, no new environment variables beyond what already exists (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXTAUTH_URL`).

---

## Components and Interfaces

### 1. Webhook Handler — `src/app/api/mercadopago/webhook/route.ts`

**Change:** After the existing `prisma.order.update` + `prisma.cart.deleteMany` block, fetch the order with its user relation and call `sendEmail`.

```
POST /api/mercadopago/webhook
  → verify payment approved
  → update order to PROCESSING
  → clear DB cart
  → fetch order with user.email, user.name, items
  → sendEmail(OrderConfirmation)   ← NEW
  → return 200
```

The email call is wrapped in its own try/catch so a Resend failure never causes a non-200 response to MercadoPago (which would trigger a retry).

The `OrderConfirmation` template requires: `orderId`, `customerName`, `items[]`, `subtotal`, `shippingFee`, `total`, `address`. All of these are available on the `Order` model (items via `include: { items: true }`, address stored as JSON on the order).

### 2. Order API — `src/app/api/orders/[id]/route.ts`

**Change:** The PUT handler already fetches `user: { select: { email, name } }` in the `include`. After the update, add a non-blocking `sendEmail` call.

```
PUT /api/orders/:id
  → validate admin auth
  → prisma.order.update (already includes user.email, user.name)
  → if order.user?.email exists:
      sendEmail(OrderStatusUpdate)   ← NEW
  → return 200 with updated order
```

The `OrderStatusUpdate` template requires: `orderId`, `customerName`, `previousStatus`, `newStatus`, `frontendUrl`. The `previousStatus` must be fetched before the update — a `findUnique` call is added before `update`, or the update is changed to a two-step fetch-then-update.

Design decision: use a two-step approach (fetch current status, then update) to avoid an extra DB round-trip pattern. The fetch is cheap and keeps the code readable.

### 3. Cart Merge — `src/app/api/cart/merge/route.ts` (new file)

A new POST endpoint at `/api/cart/merge` accepts an array of local cart items and merges them into the authenticated user's DB cart.

```
POST /api/cart/merge
  Body: { items: CartItem[] }
  → requireAuth
  → upsert Cart record for user
  → for each incoming item:
      find existing CartItem by (cartId, productId, size)
      if found: update quantity = existing.quantity + incoming.quantity
      if not found: create new CartItem
  → return full merged cart
```

**Cart Store change** — `src/store/cart-store.ts`:

A new `mergeWithServer` action is added to the store. It is called from the NextAuth `signIn` callback or from a client component that listens to the session state change.

```
mergeWithServer: async () => {
  const localItems = get().items
  if (localItems.length === 0) {
    // load DB cart via GET /api/cart, setItems
    return
  }
  try {
    const res = await fetch('/api/cart/merge', { method: 'POST', body: JSON.stringify({ items: localItems }) })
    const { cart } = await res.json()
    get().setItems(mapDbCartToStoreItems(cart))
    // localStorage is automatically updated by zustand persist
  } catch (err) {
    console.error('[Cart] Merge failed, retaining local cart', err)
  }
}
```

The trigger point is a `useEffect` in the root layout (or a dedicated `CartSyncProvider` client component) that watches `useSession().status` and calls `mergeWithServer` when it transitions to `'authenticated'`.

### 4. Search Input — `src/components/store/search-input.tsx` (new file)

A new `'use client'` component that manages a controlled input and debounces URL updates.

```tsx
'use client'
// Props: defaultValue?: string
// Uses: useRouter, useSearchParams, usePathname from next/navigation
// Debounce: setTimeout / clearTimeout pattern (no extra library needed)

export function SearchInput({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? '')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('search', value)
      } else {
        params.delete('search')
      }
      params.set('page', '1')
      router.replace(`${pathname}?${params.toString()}`)
    }, 300)
    return () => clearTimeout(timer)
  }, [value])

  return <input value={value} onChange={(e) => setValue(e.target.value)} ... />
}
```

**Collection Page change** — `src/app/(store)/collection/page.tsx`:

Replace the static heading area with `<SearchInput defaultValue={params.search} />`. The component is placed above the product grid, inside a `<Suspense>` boundary (required because `useSearchParams` suspends).

### 5. Wishlist Button — `src/components/store/wishlist-button.tsx` (new file)

A new `'use client'` component that accepts `productId` and `initialWishlisted` props and manages optimistic toggle state.

```tsx
'use client'
// Props: productId: string, initialWishlisted: boolean
// State: wishlisted (boolean), loading (boolean)
// On click (authenticated): optimistic update → API call → revert on error
// On click (guest): router.push('/login')
```

**ProductCard change** — `src/components/store/product-card.tsx`:

Add optional props `wishlisted?: boolean` and `showWishlist?: boolean`. When `showWishlist` is true, render `<WishlistButton>` absolutely positioned over the card image.

**Collection Page / ProductGrid change**:

The collection page is a Server Component that already has the session available via `auth()`. It fetches the user's wishlist IDs in parallel with the product query and passes `wishlisted` down to each `ProductCard`.

```ts
const [products, total, categories, allProducts, wishlistIds] = await Promise.all([
  prisma.product.findMany(...),
  prisma.product.count(...),
  prisma.category.findMany(...),
  prisma.product.findMany(...),
  session?.user?.id
    ? prisma.wishlist.findMany({ where: { userId: session.user.id }, select: { productId: true } })
    : Promise.resolve([]),
])
const wishlistSet = new Set(wishlistIds.map((w) => w.productId))
```

---

## Data Models

No schema changes are required. All necessary data already exists:

| Model | Relevant fields |
|---|---|
| `Order` | `id`, `userId`, `status`, `items`, `amount`, `address`, `shippingFee` |
| `OrderItem` | `name`, `price`, `quantity`, `size`, `image` |
| `User` | `email`, `name` |
| `Cart` / `CartItem` | `userId`, `productId`, `size`, `quantity`, `color` |
| `Wishlist` | `userId`, `productId` |

The merge endpoint uses the existing `Cart` and `CartItem` models with the existing unique constraint on `(cartId, productId, size)` (enforced at the application layer via `findFirst` + conditional upsert, matching the existing POST `/api/cart` pattern).

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Order confirmation email contains required order data

*For any* order with any set of items and total amount, the `OrderConfirmation` email template rendered with those props SHALL produce output that contains the order ID, each item's name, and the total amount.

**Validates: Requirements 1.2**

---

### Property 2: Webhook calls email service for any approved payment

*For any* approved MercadoPago payment event referencing a valid order, the webhook handler SHALL invoke the Email_Service exactly once with the order owner's email address as the recipient.

**Validates: Requirements 1.1**

---

### Property 3: Order status update email contains required fields

*For any* order ID and any new order status value, the `OrderStatusUpdate` email template rendered with those props SHALL produce output that contains the order ID and the new status label.

**Validates: Requirements 2.2**

---

### Property 4: Order API calls email service after any status update

*For any* order with a user email on record, when the PUT handler successfully updates the order status, the Email_Service SHALL be called once with the user's email as the recipient.

**Validates: Requirements 2.1**

---

### Property 5: Cart merge correctness

*For any* combination of local cart items and existing database cart items, the merge operation SHALL produce a result where:
- items matching by `(productId, size)` have quantity equal to the sum of local and DB quantities, and
- items present only in the local cart appear as new records in the result.

**Validates: Requirements 3.2, 3.3**

---

### Property 6: Cart store reflects server state after successful merge

*For any* non-empty local cart and any valid merge response from the server, after `mergeWithServer` completes successfully, the Zustand store's `items` SHALL equal the items returned by the server and the localStorage guest cart SHALL be cleared.

**Validates: Requirements 3.1, 3.4**

---

### Property 7: Search input debounce — URL updated after 300 ms for any input

*For any* string typed into the `SearchInput` (including the empty string), the `search` URL parameter SHALL NOT be updated before 300 ms have elapsed since the last keystroke, and SHALL be updated within a reasonable margin after 300 ms. When the value is empty, the `search` parameter SHALL be removed from the URL.

**Validates: Requirements 4.2, 4.5**

---

### Property 8: Search input pre-populates from URL for any search param value

*For any* non-empty `search` query parameter value present in the URL when `SearchInput` mounts, the component's text field SHALL display that exact value.

**Validates: Requirements 4.4**

---

### Property 9: Search URL update always resets page to 1

*For any* search string and any current page number, when `SearchInput` updates the URL, the `page` parameter in the resulting URL SHALL be `1`.

**Validates: Requirements 4.6**

---

### Property 10: Wishlist button icon state matches wishlist membership for any product

*For any* product ID and any wishlist set, the `WishlistButton` SHALL render a filled icon if and only if the product ID is a member of the wishlist set.

**Validates: Requirements 5.1**

---

### Property 11: Wishlist toggle is correct for any product state

*For any* product and any initial wishlist state (in or out), clicking the `WishlistButton` SHALL optimistically flip the icon state immediately and call the correct Wishlist_API method (POST if adding, DELETE if removing).

**Validates: Requirements 5.2, 5.3**

---

### Property 12: Wishlist button is disabled during any in-flight API request

*For any* product, between the moment the `WishlistButton` is clicked and the moment the API call resolves (success or error), the button SHALL be in a disabled state.

**Validates: Requirements 5.6**

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Resend fails on webhook | Caught in inner try/catch; error logged; webhook returns 200 |
| Resend fails on order PUT | Caught in inner try/catch; error logged; PUT returns 200 with updated order |
| Order not found in webhook | Early return 200 before email attempt |
| User has no email on order | Skip email, log warning, return 200 |
| Cart merge API error | Store retains localStorage items; error logged to console |
| Wishlist API error | Button reverts to pre-click state; toast error shown to user |
| Guest clicks wishlist button | Redirect to `/login` via `router.push` |
| SearchInput — network error on navigation | Next.js router handles gracefully; no special handling needed |

---

## Testing Strategy

The project currently has no test runner configured. The recommended setup is **Vitest** (compatible with Next.js, fast, supports jsdom for component tests) with **fast-check** for property-based testing.

```bash
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/user-event fast-check
```

### Unit Tests (example-based)

- Webhook handler: returns 200 when order not found (no email sent)
- Webhook handler: returns 200 when email service throws
- Order PUT handler: returns 200 with order when email service throws
- Order PUT handler: skips email when user.email is null
- Cart store: loads DB cart (no merge) when local cart is empty on login
- SearchInput: renders an input element
- WishlistButton: redirects guest user to `/login` on click

### Property-Based Tests (fast-check, minimum 100 iterations each)

Each test is tagged with the property it validates.

**Feature: production-readiness, Property 1: Order confirmation email contains required order data**
- Generator: random `OrderConfirmationProps` (random orderId, customerName, 1–10 items with random names/prices/quantities, random total)
- Assertion: rendered HTML string contains orderId, all item names, total

**Feature: production-readiness, Property 2: Webhook calls email service for any approved payment**
- Generator: random orderId + userEmail + order items
- Setup: mock `prisma.order.update`, `prisma.order.findUnique` (returns generated order), mock `sendEmail`
- Assertion: `sendEmail` called once with `to === userEmail`

**Feature: production-readiness, Property 3: Order status update email contains required fields**
- Generator: random `OrderStatusUpdateProps` (random orderId, customerName, previousStatus, newStatus from enum)
- Assertion: rendered HTML string contains orderId and newStatus label

**Feature: production-readiness, Property 4: Order API calls email service after any status update**
- Generator: random orderId + userEmail + OrderStatus value
- Setup: mock `prisma.order.findUnique` (returns order with previous status), mock `prisma.order.update`, mock `sendEmail`
- Assertion: `sendEmail` called once with `to === userEmail`

**Feature: production-readiness, Property 5: Cart merge correctness**
- Generator: random arrays of local CartItems and DB CartItems with possible overlapping (productId, size) pairs
- Assertion: for each overlapping pair, merged quantity = local.quantity + db.quantity; for non-overlapping local items, they appear in result

**Feature: production-readiness, Property 6: Cart store reflects server state after successful merge**
- Generator: random non-empty local cart items + random server response cart items
- Setup: mock `fetch` to return generated server response
- Assertion: `store.items` equals mapped server items after `mergeWithServer` resolves

**Feature: production-readiness, Property 7: Search input debounce**
- Generator: random non-empty strings (including whitespace-only and empty string)
- Setup: fake timers via `vi.useFakeTimers()`
- Assertion: URL not updated before 300 ms; URL updated after 300 ms; empty string removes `search` param

**Feature: production-readiness, Property 8: Search input pre-populates from URL**
- Generator: random non-empty strings as `defaultValue`
- Assertion: rendered input's `value` attribute equals the generated string

**Feature: production-readiness, Property 9: Search URL update always resets page to 1**
- Generator: random search strings + random page numbers (2–100)
- Assertion: after debounce fires, URL contains `page=1`

**Feature: production-readiness, Property 10: Wishlist button icon state matches wishlist membership**
- Generator: random productId + random Set of wishlist productIds (productId may or may not be in set)
- Assertion: button has `aria-label="Quitar de favoritos"` iff productId in set, else `aria-label="Agregar a favoritos"`

**Feature: production-readiness, Property 11: Wishlist toggle is correct for any product state**
- Generator: random productId + random initial `wishlisted` boolean
- Setup: mock `fetch`
- Assertion: after click, icon state is flipped; fetch called with POST if was false, DELETE if was true

**Feature: production-readiness, Property 12: Wishlist button is disabled during any in-flight API request**
- Generator: random productId + random initial wishlisted state
- Setup: mock `fetch` with a promise that never resolves (pending)
- Assertion: button has `disabled` attribute after click and before promise resolves
