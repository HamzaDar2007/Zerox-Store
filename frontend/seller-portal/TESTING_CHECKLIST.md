# Seller Portal Testing Checklist

Comprehensive checklist for verifying all seller portal functionality.

## Prerequisites

- [ ] Backend running on port 3001
- [ ] Database migrated (including migration 1700000000014-AddSellerReplyToReviews)
- [ ] Seller portal dev server running on port 3002
- [ ] Test user account created with seller role

---

## 1. Auth

### Login
- [ ] Login form validates required fields
- [ ] Invalid credentials show error toast
- [ ] Non-seller users are rejected with "requires seller role" message
- [ ] Successful login redirects to dashboard
- [ ] Auth tokens stored in localStorage (seller-auth key)
- [ ] "Forgot Password" link works
- [ ] "Register" link works

### Register
- [ ] Registration form validates all fields (email, name, password min 8)
- [ ] Successful registration shows email verification message
- [ ] Link to login page works

### Forgot Password
- [ ] Email field required
- [ ] Success state shows "check email" message
- [ ] Link back to login works

### Reset Password
- [ ] Validates token from URL
- [ ] Password confirmation must match
- [ ] Success redirects to login

### Session
- [ ] 30-minute idle timeout works
- [ ] Token refresh on 401 works silently
- [ ] Logout clears localStorage and redirects

---

## 2. Onboarding

- [ ] Step 1: Business info form (displayName required)
- [ ] Step 1: Creates seller profile via POST /sellers
- [ ] Step 1: Seller role auto-assigned in backend
- [ ] Step 2: Store setup (name, slug required, slug validated)
- [ ] Step 2: Creates store via POST /stores
- [ ] Step 3: Logo upload (optional)
- [ ] Step 3: Banner upload (optional)
- [ ] Step 3: Skip button works
- [ ] Step 4: Completion message shown
- [ ] "Go to Dashboard" navigates correctly

---

## 3. Dashboard

- [ ] Shows store stats (products, orders, revenue, rating)
- [ ] Revenue trend chart renders with data
- [ ] Recent orders list shows up to 5 orders
- [ ] Order click navigates to order detail
- [ ] Low stock alerts show products with ≤5 stock
- [ ] Empty state shows when no store exists

---

## 4. Products

### List View
- [ ] Products filtered by storeId
- [ ] DataTable search works
- [ ] Pagination works
- [ ] Sort by name/price/created works
- [ ] CSV/Excel/PDF export works
- [ ] "Add Product" opens form view

### Create/Edit Form
- [ ] All fields render correctly
- [ ] Name and slug required
- [ ] Category/Brand dropdowns populated
- [ ] Status dropdown (draft/active/archived)
- [ ] Active/Digital toggles work
- [ ] Create saves product and switches to Variants tab
- [ ] Edit pre-fills all fields
- [ ] Back button returns to list

### Variants Tab (after save)
- [ ] Add Variant dialog works
- [ ] SKU required, price validation
- [ ] Edit variant pre-fills form
- [ ] Delete variant works

### Images Tab (after save)
- [ ] File uploader works
- [ ] Image preview displays
- [ ] Delete image (hover X button) works

### Delete
- [ ] Confirmation dialog appears
- [ ] Delete removes product from list

---

## 5. Inventory

- [ ] Shows all products with stock levels
- [ ] Low stock (≤5) highlighted in amber
- [ ] Out of stock (0) highlighted in red
- [ ] "Update Stock" dialog opens
- [ ] Stock value saves correctly
- [ ] Search by product name works

---

## 6. Orders

### List
- [ ] Orders filtered by storeId
- [ ] DataTable with search, pagination, export
- [ ] "View Details" navigates to order detail

### Detail
- [ ] Order summary cards (total, items, shipments)
- [ ] Order items list shows correctly
- [ ] Cancel button appears for pending orders
- [ ] Cancel confirmation dialog works
- [ ] Create Shipment dialog works (carrier required)
- [ ] Shipment appears after creation
- [ ] Add Tracking Event to shipment works
- [ ] Back button returns to orders list

---

## 7. Returns

- [ ] Returns list renders
- [ ] Pagination works
- [ ] View button opens detail sheet
- [ ] Return detail shows status, reason, date
- [ ] Return items listed

---

## 8. Earnings

- [ ] Revenue stats cards show correctly
- [ ] Monthly revenue bar chart renders
- [ ] Recent payments list shows
- [ ] All amounts formatted as currency

---

## 9. Reviews

- [ ] Reviews list with star ratings
- [ ] Average rating stat card
- [ ] Response rate calculation
- [ ] Reply button opens detail sheet
- [ ] Star rating component renders correctly
- [ ] Reply textarea and submit works (PATCH /reviews/:id/reply)
- [ ] Replied reviews show "Your Reply" card
- [ ] Unreplied reviews show reply form

---

## 10. Chat

- [ ] Thread list loads
- [ ] Selecting thread shows messages
- [ ] Messages display as bubbles (sent vs received)
- [ ] Send message works
- [ ] Enter key sends message
- [ ] Auto-scroll to latest message
- [ ] Mobile: back button returns to thread list
- [ ] Thread marked as read on selection

---

## 11. Notifications

- [ ] Notification list renders
- [ ] Unread notifications highlighted
- [ ] Blue dot indicator on unread
- [ ] Mark single notification as read
- [ ] "Mark All Read" button works
- [ ] Delete notification works
- [ ] Header bell icon shows unread count
- [ ] Empty state when no notifications

---

## 12. Store Settings

- [ ] Current values pre-filled
- [ ] Name and slug required
- [ ] Slug format validated (lowercase, hyphens, numbers)
- [ ] Save button disabled when no changes
- [ ] Logo upload works with preview
- [ ] Banner upload works with preview

---

## 13. Account Settings

- [ ] Profile info displayed (read-only)
- [ ] Password change form validates
- [ ] Current password required
- [ ] New password min 8 characters
- [ ] Confirm password must match
- [ ] Sign out button works

---

## 14. Analytics

- [ ] Revenue trend (30 days) area chart
- [ ] Daily orders line chart
- [ ] Order status pie chart
- [ ] Product status pie chart
- [ ] Review stats cards
- [ ] All stat cards show correct values

---

## 15. UI/UX

- [ ] Dark mode toggle works
- [ ] Theme persisted across refresh
- [ ] Sidebar collapse/expand works
- [ ] Mobile sidebar overlay works
- [ ] Breadcrumbs show correct path
- [ ] Active nav item highlighted
- [ ] Loading states (skeletons) render
- [ ] Error states with retry button render
- [ ] Empty states render with appropriate messages
- [ ] All toasts appear on success/error
- [ ] Page transitions are smooth

---

## 16. Security

- [ ] Non-authenticated users redirected to /login
- [ ] Non-seller users shown /unauthorized
- [ ] JWT token injected on API calls
- [ ] Refresh token rotation works
- [ ] Session timeout after 30 min idle
- [ ] No sensitive data in localStorage except tokens
