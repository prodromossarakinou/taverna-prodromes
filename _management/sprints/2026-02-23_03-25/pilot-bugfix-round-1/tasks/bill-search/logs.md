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

# bill-search — Logs

Status: OPEN → COMPLETED  
Updated: 2026-02-23 09:22

## Scope
- Add search to the Kitchen Bill popup (not the /bills page).
- Client-side filtering only; do not change API.
- Filter base orders list by partial, case-insensitive match on:
  - `tableNumber`
  - `waiterName`
- Must work with:
  - Status logic (exclude `cancelled`, `closed`, `deleted`; allow `completed`)
  - Base-order selection logic
  - Extras derivation (base + its extras via `parentId`)

## Implementation
- File: `components/features/kitchen/KitchenDisplay.tsx`
  - Added local state `billSearch` and a search input inside the Bill popup header (only shown when selecting base orders).
  - Kept the status exclusions: only `cancelled`, `closed`, `deleted` are filtered out; `completed` is allowed.
  - Search runs over BASE orders only (`!isExtra && !parentId`).
  - Grouping by table preserves existing UX; base buttons listed per table are filtered according to the search.
  - No API calls added/modified; purely in-memory filter.

## Why this approach
- Keeps the base+extras rule intact (selection always starts from a base root).
- Avoids extra data fetching; instant UI updates.
- Maintains compatibility with existing duplicate-prevention and scoping rules on the server.

## Verification
1) Create multiple tables and several base orders with different `waiterName`s.
2) Open Kitchen → Bill popup.
3) Type a table number fragment (e.g., `12`) → only base orders for matching tables remain visible.
4) Type a waiter name fragment (e.g., `nik`) → only base orders for that waiter remain.
5) Click a matching base → preview shows only that base + its extras; totals correct.
6) Confirm no flicker/remount of the popup and scrolling remains stable.
7) Confirm `completed` orders appear; `cancelled`/`closed`/`deleted` do not.

## Acceptance
- Typing table filters correctly.
- Typing waiter filters correctly.
- Works with many tables.
- No popup flicker.
- Base+extras rule intact.

## Commit
Message: `feat(kitchen): bill popup search by table/waiter (client-side)`
