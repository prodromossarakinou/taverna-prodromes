# Tasks — Pilot Bugfix Round 1

All documentation in this sprint must be written in English only.

Each task has a dedicated log at `tasks/<task-name>/logs.md` for investigation notes, fixes, and verification steps.

---

## kitchen-order-limit
Problem
- Kitchen only shows the first 10 orders.

Expected
- All active orders must be visible.

Log
- See: `tasks/kitchen-order-limit/logs.md`

---

## bills-status-filter
Problem
- Bills cannot be filtered by status.

Expected
- Add filter options:
  - All
  - Open
  - Closed

Log
- See: `tasks/bills-status-filter/logs.md`

---

## auto-close-order-on-bill
Problem
- Creating a bill does not change order status.

Expected
- When a bill is created: `order.status = closed`.

Log
- See: `tasks/auto-close-order-on-bill/logs.md`

---

## soft-delete-orders
Problem
- Orders are permanently deleted.

Expected
- Replace hard delete with soft delete: `status = deleted`.
- Kitchen must still be able to view them.

Log
- See: `tasks/soft-delete-orders/logs.md`

---

## kitchen-order-editing
Problem
- Kitchen needs inline editing capabilities during operations.

Expected
- Kitchen should be able to:
  - Remove items
  - Adjust quantities
  - Rename table

Log
- See: `tasks/kitchen-order-editing/logs.md`

---

## bill-search
Problem
- Bills list lacks search functionality.

Expected
- Support search by:
  - Table (table number)
  - Waiter (via dropdown populated from orders)
  - Must compose with status filters (All/Open/Closed)

Log
- See: `tasks/bill-search/logs.md`

---

## kitchen-stable-sorting
Problem
- In Kitchen order cards, items and units re-ordered whenever their status changed, causing UI jitter and loss of mental mapping.

Expected
- Stable, locale-aware alphabetical ordering that does not depend on status changes:
  - Categories: A–Z / Α–Ω (Greek + English)
  - Products within category: A–Z / Α–Ω
  - Units within an item: by numeric `unitIndex` ascending; fallback by `id` with numeric compare

Log
- See: `tasks/kitchen-stable-sorting/logs.md`

---

## bill-actions
Problem
- Operators cannot perform common actions directly from the bills list.

Expected
- Add "Close Bill" action on the bill card.
- API: `PATCH /api/bills/:id` with `{ status: "closed" }`.
- UI updates instantly after action.

Log
- See: `tasks/bill-actions/logs.md`

---

## billing-avoid-duplicate-table-merge
Problem
- When creating a bill, different base orders that share the same `tableNumber` are incorrectly merged into one bill.

Expected
- Merge must occur only within the same base order group:
  - Select a specific base (non-extra) order as the root
  - Include only its extras where `isExtra = true` and `parentId = baseOrderId`
  - Do not merge unrelated base orders that coincidentally share the same `tableNumber`

Log
- See: `tasks/billing-avoid-duplicate-table-merge/logs.md`
