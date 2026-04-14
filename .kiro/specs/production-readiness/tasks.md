# Implementation Plan: Production Readiness

## Overview

Close five production-readiness gaps in the Harry's Boutique Next.js app: order confirmation emails, order status update emails, guest cart merge on login, debounced search input, and wishlist button state on product cards. All changes are surgical — no schema migrations, no new infrastructure.

## Tasks

- [x] 1. Install test dependencies
  - Run `npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom fast-check` in `harrys-boutique-next/`
  - Add `vitest.config.ts` at `harrys-boutique-next/vitest.config.ts` with jsdom environment and path aliases matching `tsconfig.json`
  - Add `"test": "vitest --run"` and `"test:watch": "vitest"` scripts to `harrys-boutique-next/package.json`
  - Create `harrys-boutique-next/src/__tests__/` directory with a `.gitkeep`
  - _Requirements: all (testing infrastructure)_

- [x] 2. Create email templates
  - [x] 2.1 Create `OrderConfirmation` React Email template at `src/lib/email/templates/order-confirmation.tsx`
    - Accept props: `orderId`, `customerName`, `items[]` (name, price, quantity, size, image), `subtotal`, `shippingFee`, `total`, `address`
    - Render a readable HTML email using `@react-email/components` primitives
    - _Requirements: 1.2_

  - [ ]* 2.2 Write property test for OrderConfirmation template (Property 1)
    - **Property 1: Order confirmation email contains required order data**
    - **Validates: Requirements 1.2**
    - Generator: random `orderId`, `customerName`, 1–10 items with random names/prices/quantities, random total
    - Assertion: rendered HTML string contains `orderId`, all item names, and total amount

  - [x] 2.3 Create `OrderStatusUpdate` React Email template at `src/lib/email/templates/order-status-update.tsx`
    - Accept props: `orderId`, `customerName`, `previousStatus`, `newStatus`, `frontendUrl`
    - Render a readable HTML email showing the status transition
    - _Requirements: 2.2_

  - [ ]* 2.4 Write property test for OrderStatusUpdate template (Property 3)
    - **Property 3: Order status update email contains required fields**
    - **Validates: Requirements 2.2**
    - Generator: random `orderId`, `customerName`, `previousStatus`, `newStatus` drawn from the `OrderStatus` enum
    - Assertion: rendered HTML string contains `orderId` and `newStatus` label

- [x] 3. Add order confirmation email to MercadoPago webhook
  - [x] 3.1 Modify `src/app/api/mercadopago/webhook/route.ts`
    - After the existing `prisma.cart.deleteMany` call, fetch the order with `include: { items: true, user: { select: { email: true, name: true } } }`
    - If `order.user?.email` exists, call `sendEmail(OrderConfirmation)` inside a try/catch that logs errors but does not rethrow
    - Import `sendEmail` from `@/lib/email` and `OrderConfirmation` from the new template
    - _Requirements: 1.1, 1.3, 1.4_

  - [ ]* 3.2 Write property test for webhook email trigger (Property 2)
    - **Property 2: Webhook calls email service for any approved payment**
    - **Validates: Requirements 1.1**
    - Generator: random `orderId`, `userEmail`, random order items
    - Setup: mock `prisma.order.update`, `prisma.order.findUnique` (returns generated order with user), mock `sendEmail`
    - Assertion: `sendEmail` called exactly once with `to === userEmail`

- [x] 4. Add order status update email to Order API
  - [x] 4.1 Modify `src/app/api/orders/[id]/route.ts` PUT handler
    - Before `prisma.order.update`, add a `prisma.order.findUnique` call to capture `previousStatus`
    - After the update, if `order.user?.email` exists, call `sendEmail(OrderStatusUpdate)` inside a try/catch that logs errors but does not rethrow
    - Pass `previousStatus`, `newStatus` (`data!.status`), `orderId`, `customerName`, and `NEXTAUTH_URL` as `frontendUrl`
    - Import `sendEmail` and `OrderStatusUpdate` template
    - _Requirements: 2.1, 2.3, 2.4_

  - [ ]* 4.2 Write property test for Order API email trigger (Property 4)
    - **Property 4: Order API calls email service after any status update**
    - **Validates: Requirements 2.1**
    - Generator: random `orderId`, `userEmail`, random `OrderStatus` value
    - Setup: mock `prisma.order.findUnique` (returns order with previous status), mock `prisma.order.update`, mock `sendEmail`
    - Assertion: `sendEmail` called exactly once with `to === userEmail`

- [x] 5. Checkpoint — email features
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Create cart merge API endpoint
  - [x] 6.1 Create `src/app/api/cart/merge/route.ts`
    - POST handler: validate auth via `requireAuth`, accept body `{ items: CartItem[] }` validated with zod
    - Upsert the user's `Cart` record, then for each incoming item: `findFirst` by `(cartId, productId, size)` — if found update quantity (sum), if not found create new `CartItem`
    - Return the full merged cart with product details (matching the shape returned by `GET /api/cart`)
    - _Requirements: 3.2, 3.3_

  - [ ]* 6.2 Write property test for cart merge correctness (Property 5)
    - **Property 5: Cart merge correctness**
    - **Validates: Requirements 3.2, 3.3**
    - Generator: random arrays of local `CartItem[]` and DB `CartItem[]` with possible overlapping `(productId, size)` pairs
    - Assertion: overlapping pairs have quantity = local + DB; non-overlapping local items appear as new records

- [x] 7. Add `mergeWithServer` action to cart store and create `CartSyncProvider`
  - [x] 7.1 Add `mergeWithServer` async action to `src/store/cart-store.ts`
    - If local items are empty: fetch `GET /api/cart` and call `setItems` with mapped DB cart items
    - If local items exist: POST to `/api/cart/merge` with current items, call `setItems` with mapped response, catch errors and retain local items with `console.error`
    - Add a `mapDbCartToStoreItems` helper that converts the Prisma cart shape to `CartItem[]`
    - _Requirements: 3.1, 3.4, 3.5, 3.6_

  - [x] 7.2 Create `src/components/store/cart-sync-provider.tsx` client component
    - `'use client'` component that calls `useSession()` and `useCartStore`
    - `useEffect` watching `session.status`: when it transitions to `'authenticated'`, call `mergeWithServer()`
    - Renders `null` (no UI); wrap in `<SessionProvider>` context already present in `providers.tsx`
    - Add `<CartSyncProvider />` to `src/app/layout.tsx` (or `providers.tsx`) inside the existing session provider
    - _Requirements: 3.1, 3.4_

  - [ ]* 7.3 Write property test for cart store merge (Property 6)
    - **Property 6: Cart store reflects server state after successful merge**
    - **Validates: Requirements 3.1, 3.4**
    - Generator: random non-empty local cart items + random server response cart items
    - Setup: mock `fetch` to return generated server response
    - Assertion: `store.items` equals mapped server items after `mergeWithServer` resolves

- [x] 8. Checkpoint — cart merge
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Create `SearchInput` component and integrate into collection page
  - [x] 9.1 Create `src/components/store/search-input.tsx`
    - `'use client'` component accepting `defaultValue?: string`
    - Controlled input with `useState`; `useEffect` with 300 ms `setTimeout`/`clearTimeout` debounce
    - On debounce fire: build `URLSearchParams` from current `searchParams`, set or delete `search`, reset `page` to `'1'`, call `router.replace`
    - Style to match existing inputs in the project (Tailwind)
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.6_

  - [ ]* 9.2 Write property test for search debounce (Property 7)
    - **Property 7: Search input debounce — URL updated after 300 ms for any input**
    - **Validates: Requirements 4.2, 4.5**
    - Generator: random strings (including empty string)
    - Setup: fake timers via `vi.useFakeTimers()`; mock `useRouter`, `useSearchParams`, `usePathname`
    - Assertion: `router.replace` not called before 300 ms; called after 300 ms; empty string removes `search` param

  - [ ]* 9.3 Write property test for search pre-population (Property 8)
    - **Property 8: Search input pre-populates from URL for any search param value**
    - **Validates: Requirements 4.4**
    - Generator: random non-empty strings as `defaultValue`
    - Assertion: rendered `<input>` value equals the generated string

  - [ ]* 9.4 Write property test for page reset on search (Property 9)
    - **Property 9: Search URL update always resets page to 1**
    - **Validates: Requirements 4.6**
    - Generator: random search strings + random page numbers (2–100)
    - Assertion: after debounce fires, URL contains `page=1`

  - [x] 9.5 Integrate `SearchInput` into `src/app/(store)/collection/page.tsx`
    - Import `SearchInput` and wrap it in a `<Suspense>` boundary (required by `useSearchParams`)
    - Place it in the header row above the product grid, alongside the existing `<SortSelect>`
    - Pass `defaultValue={params.search}` to pre-populate from URL
    - _Requirements: 4.1, 4.3, 4.4_

- [x] 10. Create `WishlistButton` component and extend `ProductCard`
  - [x] 10.1 Create `src/components/store/wishlist-button.tsx`
    - `'use client'` component accepting `productId: string`, `initialWishlisted: boolean`
    - Local state: `wishlisted` (boolean), `loading` (boolean)
    - On click when authenticated: set `loading = true`, optimistically flip `wishlisted`, call `POST /api/wishlist` or `DELETE /api/wishlist?productId=...`, on error revert state and show `toast.error`, always set `loading = false`
    - On click when guest (`session === null`): call `router.push('/login')`
    - Render a heart icon button; `aria-label="Agregar a favoritos"` when not wishlisted, `aria-label="Quitar de favoritos"` when wishlisted; `disabled` while `loading`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 10.2 Write property test for wishlist button icon state (Property 10)
    - **Property 10: Wishlist button icon state matches wishlist membership for any product**
    - **Validates: Requirements 5.1**
    - Generator: random `productId` + random boolean `initialWishlisted`
    - Assertion: button has `aria-label="Quitar de favoritos"` iff `initialWishlisted === true`

  - [ ]* 10.3 Write property test for wishlist toggle (Property 11)
    - **Property 11: Wishlist toggle is correct for any product state**
    - **Validates: Requirements 5.2, 5.3**
    - Generator: random `productId` + random initial `wishlisted` boolean
    - Setup: mock `fetch`; mock `useSession` to return authenticated session
    - Assertion: after click, icon state is flipped; `fetch` called with `POST` if was `false`, `DELETE` if was `true`

  - [ ]* 10.4 Write property test for wishlist button disabled during request (Property 12)
    - **Property 12: Wishlist button is disabled during any in-flight API request**
    - **Validates: Requirements 5.6**
    - Generator: random `productId` + random initial `wishlisted` boolean
    - Setup: mock `fetch` with a promise that never resolves
    - Assertion: button has `disabled` attribute after click and before promise resolves

  - [x] 10.5 Extend `src/components/store/product-card.tsx`
    - Add optional props `wishlisted?: boolean` and `showWishlist?: boolean` to the `Product` interface and component
    - When `showWishlist` is true, render `<WishlistButton productId={product.id} initialWishlisted={wishlisted ?? false} />` absolutely positioned over the card image (top-right corner)
    - _Requirements: 5.1_

  - [x] 10.6 Fetch wishlist IDs in `src/app/(store)/collection/page.tsx` and pass to `ProductCard`
    - Import `auth` from `@/auth` and call it to get the session
    - Add `prisma.wishlist.findMany` to the existing `Promise.all`, guarded by `session?.user?.id`
    - Build a `Set<string>` of wishlist product IDs
    - Pass `wishlisted={wishlistSet.has(p.id)}` and `showWishlist={true}` to each `ProductCard` via `ProductGrid` (or directly if grid passes through props)
    - _Requirements: 5.1_

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All TypeScript — no language change needed
- No schema migrations required; all Prisma models already exist
- Email calls are always wrapped in try/catch so failures never block the main response
- `CartSyncProvider` must be inside the existing `SessionProvider` in `providers.tsx` or `layout.tsx`
- `SearchInput` requires a `<Suspense>` boundary because it calls `useSearchParams()`
- Property tests use `fast-check` with a minimum of 100 iterations each
