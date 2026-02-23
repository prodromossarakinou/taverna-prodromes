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
  - Table
  - Name
  - Order id

Log
- See: `tasks/bill-search/logs.md`
