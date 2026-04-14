# Requirements Document

## Introduction

This document covers the four remaining gaps that must be closed before Harry's Boutique Next.js app is considered production-ready. The gaps are: (1) email notifications not triggered after payment approval and order status changes, (2) guest cart not merged with the authenticated user's database cart on login, (3) the product search input not updating the URL in real-time, and (4) the wishlist button on product cards not reflecting the user's saved wishlist state.

## Glossary

- **Webhook_Handler**: The Next.js API route at `/api/mercadopago/webhook/route.ts` that receives payment events from MercadoPago.
- **Order_API**: The Next.js API route at `/api/orders/[id]/route.ts` that handles order status updates.
- **Email_Service**: The `sendEmail` function in `lib/email/index.ts` backed by Resend.
- **Cart_Store**: The Zustand store (`store/cart-store.ts`) that persists guest cart items to `localStorage` under the key `harrys-cart`.
- **Cart_API**: The Next.js API routes at `/api/cart` that manage the authenticated user's server-side cart in PostgreSQL via Prisma.
- **Search_Input**: A client-side React component that renders a text field for product search on the collection page.
- **Collection_Page**: The Next.js page at `/collection` that reads `searchParams.search` and queries products via Prisma.
- **Wishlist_Button**: The interactive button rendered on each `ProductCard` component that allows users to add or remove a product from their wishlist.
- **Wishlist_API**: The Next.js API routes at `/api/wishlist` that manage the authenticated user's wishlist in PostgreSQL.
- **OrderConfirmation_Email**: The React email template that is sent to a customer after a payment is approved.
- **OrderStatusUpdate_Email**: The React email template that is sent to a customer when an admin changes the status of their order.

---

## Requirements

### Requirement 1: Order Confirmation Email on Payment Approval

**User Story:** As a customer, I want to receive an order confirmation email after my payment is approved, so that I have a record of my purchase.

#### Acceptance Criteria

1. WHEN the Webhook_Handler receives a MercadoPago payment event with `status === 'approved'`, THE Webhook_Handler SHALL call the Email_Service to send an OrderConfirmation_Email to the email address associated with the order.
2. WHEN the Email_Service is called for an order confirmation, THE Email_Service SHALL include the order ID, list of purchased items, and total amount in the email.
3. IF the Email_Service fails to send the OrderConfirmation_Email, THEN THE Webhook_Handler SHALL log the error and still return a `200` response to MercadoPago so the webhook is not retried due to an email failure.
4. IF the order associated with the payment's `external_reference` does not exist in the database, THEN THE Webhook_Handler SHALL return a `200` response without attempting to send an email.

---

### Requirement 2: Order Status Update Email on Admin Status Change

**User Story:** As a customer, I want to receive an email when an admin updates my order status, so that I am kept informed about my order's progress.

#### Acceptance Criteria

1. WHEN the Order_API PUT handler successfully updates an order's status, THE Order_API SHALL call the Email_Service to send an OrderStatusUpdate_Email to the email address of the order's owner.
2. WHEN the Email_Service is called for a status update, THE Email_Service SHALL include the order ID and the new order status in the email.
3. IF the Email_Service fails to send the OrderStatusUpdate_Email, THEN THE Order_API SHALL log the error and still return the updated order in the `200` response so the admin operation is not blocked.
4. WHILE the order's associated user has no email address on record, THE Order_API SHALL skip sending the email and log a warning.

---

### Requirement 3: Guest Cart Merge on Login

**User Story:** As a guest shopper, I want my cart items to be preserved when I log in, so that I do not lose the products I selected before authenticating.

#### Acceptance Criteria

1. WHEN a user successfully logs in and the Cart_Store contains one or more items in `localStorage`, THE Cart_Store SHALL send those items to the Cart_API to be merged into the user's database cart.
2. WHEN the Cart_API receives a merge request and a cart item from `localStorage` matches an existing database cart item by `productId` and `size`, THE Cart_API SHALL sum the quantities of both items into a single database record.
3. WHEN the Cart_API receives a merge request and a cart item from `localStorage` does not match any existing database cart item, THE Cart_API SHALL add that item as a new record in the database cart.
4. WHEN the merge operation completes successfully, THE Cart_Store SHALL replace its local items with the full, merged list returned by the Cart_API and clear the `localStorage` guest cart.
5. IF the Cart_API returns an error during the merge, THEN THE Cart_Store SHALL retain the existing `localStorage` items and log the error, so the user does not lose their cart.
6. WHEN a user logs in and the Cart_Store contains no items, THE Cart_Store SHALL load the user's existing database cart without performing a merge.

---

### Requirement 4: Real-Time Search Input with URL Sync

**User Story:** As a shopper, I want to type in a search box and see results update in real-time, so that I can quickly find products without submitting a form.

#### Acceptance Criteria

1. THE Search_Input SHALL render a text field on the Collection_Page that is visible to all users.
2. WHEN a user types in the Search_Input, THE Search_Input SHALL wait 300 milliseconds after the last keystroke before updating the `search` query parameter in the URL.
3. WHEN the `search` URL parameter is updated, THE Collection_Page SHALL re-fetch and display only products whose name or description contains the search term, case-insensitively.
4. WHEN the Search_Input is rendered and the URL already contains a `search` parameter, THE Search_Input SHALL pre-populate its text field with that value.
5. WHEN a user clears the Search_Input text field, THE Search_Input SHALL remove the `search` parameter from the URL within 300 milliseconds.
6. WHEN the Search_Input updates the URL, THE Search_Input SHALL reset the `page` parameter to `1` so the user sees the first page of results.

---

### Requirement 5: Wishlist Button State on Product Cards

**User Story:** As a logged-in user, I want the wishlist button on each product card to show whether I have already saved that product, so that I can see my wishlist status at a glance.

#### Acceptance Criteria

1. WHEN a logged-in user views the Collection_Page or any page that renders ProductCards, THE Wishlist_Button SHALL display a filled icon for products that are in the user's wishlist and an unfilled icon for products that are not.
2. WHEN a logged-in user clicks the Wishlist_Button on a product that is not in their wishlist, THE Wishlist_Button SHALL call the Wishlist_API to add the product and immediately update the button to the filled state.
3. WHEN a logged-in user clicks the Wishlist_Button on a product that is already in their wishlist, THE Wishlist_Button SHALL call the Wishlist_API to remove the product and immediately update the button to the unfilled state.
4. WHEN a guest user clicks the Wishlist_Button, THE Wishlist_Button SHALL redirect the user to the login page.
5. IF the Wishlist_API returns an error when adding or removing a product, THEN THE Wishlist_Button SHALL revert to its previous state and display an error indicator to the user.
6. WHILE the Wishlist_API request is in progress, THE Wishlist_Button SHALL be disabled to prevent duplicate requests.
