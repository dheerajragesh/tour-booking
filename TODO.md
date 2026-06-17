# TODO - Tour Booking Multi-Category (Professional Categories)

## Step 1: Frontend shared category list
- [x] Create `utils/categories.js` exporting the required 10 categories.

## Step 2: Reusable multi-select UI component
- [x] Implement `components/MultiSelectCategories.jsx` (searchable, chips/tags, remove, clear).


## Step 3: Admin create tour update
- [ ] Replace category toggle grid with the multi-select component.
- [ ] Enforce validation: at least one category; no duplicates.
- [ ] Ensure payload sends `categories: string[]` only (keep legacy field only for backward compat if needed).

## Step 4: Admin edit tour update
- [ ] Locate edit tour page(s) and update to multi-select + validation.

## Step 5: Tour listing badge rendering
- [ ] Update `TourCard` (or equivalent) to render all categories as badges.

## Step 6: Filter sidebar multi-select
- [ ] Replace category filter buttons with the multi-select filter component.
- [ ] Ensure selected categories display as chips.
- [ ] Ensure “Reset/Clear all” clears category selections.
- [ ] Ensure filter count is accurate.

## Step 7: Search + filter integration
- [ ] Ensure listing page applies search across category names too (frontend fallback) AND aligns with backend query params.

## Step 8: Backend API update (in your backend server)
- [ ] Update `GET /api/tours` to accept `search` + `categories=comma,separated`.
- [ ] Use regex search across required fields.
- [ ] Filter by categories using Mongo `$in`.
- [ ] Ensure pagination/sorting preserved.

## Step 9: MongoDB schema update (in backend)
- [ ] Update Tour schema: `categories: { type: [String], required: true, default: [] }`
- [ ] Prevent/handle legacy `category` field.

## Step 10: Validation + duplicate prevention
- [ ] Ensure admin UI prevents duplicates and backend tolerates duplicates safely.

## Step 11: Test
- [ ] Create tour with multiple categories -> verify stored + displayed.
- [ ] Filter sidebar with multi-select -> verify ANY-category semantics.
- [ ] Search + filter combined -> verify intersection.
- [ ] Pagination still works.

