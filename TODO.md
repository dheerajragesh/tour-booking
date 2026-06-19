# TODO - Home Search Bar + Category Filtering Fix

## Plan steps
- [ ] Add debounced real-time search behavior in `components/SearchBar.jsx`.
- [ ] Wire Home page search bar to filter across all required tour fields (title, destination, description, country, city, categories) instead of only `destination`.
- [ ] Fix category filtering to support multi-select OR logic correctly and keep selected categories persistent.
- [ ] Combine search + category filters with strict AND logic.
- [ ] Add a prominent `[Clear Filters]` action that clears both search text and selected categories and resets pagination.
- [ ] Ensure pagination remains correct after every search/category update.
- [ ] Ensure empty state matches required copy: "No tours found." + `[Clear Filters]`.
- [ ] (Optional) Add query-param persistence for refresh/back support.

## Notes
Backend currently returns all tours (no search/categories/page/limit). So for now, correctness will be handled client-side using the full in-memory filter to ensure "never return unrelated tours".

