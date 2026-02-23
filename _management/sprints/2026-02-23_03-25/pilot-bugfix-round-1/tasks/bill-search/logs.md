# bill-search — Logs

Status: COMPLETED  
Created: 2026-02-23 04:04  
Completed: 2026-02-23 04:04

## Scope
- Search bills by table number (client-side, instant).
- Filter bills by waiter via a compact dropdown populated from Orders’ `waiterName` values.
- Composes with existing status filters (All / Open / Closed) without resetting scroll or sorting.

## Investigation
- Confirmed bills are listed at `/bills` and fetched via `GET /api/bills`.
- Waiter names are not part of a fixed list; best reliable source is current orders via `GET /api/orders`.
- Sorting must stay by `createdAt` (newest first) and UI must remain responsive.

## Implementation
- File: `components/features/billing/BillsList.tsx`
  - Added search input bound to local `search` state; filters by `tableNumber` (case-insensitive).
  - Fetched waiter names from `/api/orders`, deduplicated and sorted (locale-aware), exposed as a dropdown (default: All waiters).
  - Composed filters in-memory in this order: status → table search → waiter.
  - Preserved the original stable sort (newest first) and avoided remounts to keep scroll position.

## UX
- Controls live in the header row next to the status filter buttons.
- Instant updates; no flicker.
- Works on mobile/compact layouts (Tailwind utility classes, no custom CSS).

## Verification
1. Seed/create multiple bills; include a few with different `tableNumber` and different `waiterName` values.
2. Open `/bills` and type part of a table number (e.g., `12`) in the search field — list narrows accordingly.
3. Choose a waiter from the dropdown — list shows only that waiter’s bills.
4. Toggle status filters (All/Open/Closed) — composition works and sorting remains newest first.
5. Scroll position is preserved when toggling filters.

## Notes / Follow-ups
- If the dataset becomes large, consider server-side filtering via `/api/bills?status=...` combined with query params for search/waiter, keeping the same UI.
- Optional future work: search by waiter text and by bill/order id.

## Commit
- Message: `feat(billing): bill search and waiter filter`
