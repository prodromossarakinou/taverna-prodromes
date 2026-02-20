# Task Logs — db-unit-level-item-states

Status: DONE
Owner: Michael

## Log

- 2026-02-20: Task opened.
- 2026-02-20: Decisions locked before schema/migrations.
  - Decision 1 (Unit persistence model): A) OrderItemUnit table (preferred).
    - OrderItem keeps quantity.
    - Create OrderItemUnit rows = quantity.
    - Each unit has its own status (pending/started/ready/etc).
    - Reason: clean persistence, simple queries, reversible edits.
  - Decision 2 (API update shape — minimal PATCH support):
    - Update a single unit status:
      - PATCH /api/orders/:id
      - Payload: { "unitId": "<unitId>", "unitStatus": "<status>" }
    - Bulk update units for an item:
      - PATCH /api/orders/:id
      - Payload: { "itemId": "<itemId>", "unitStatus": "<status>", "mode": "bulk" }
    - Set order status manually (edit mode):
      - PATCH /api/orders/:id
      - Payload: { "orderStatus": "<status>" }

- 2026-02-20: Prisma models (final fields)
  - Order
    - id, tableNumber, waiterName, timestamp, status, extraNotes, isExtra, parentId, items
  - OrderItem
    - id, name, quantity, category, itemStatus, extraNotes, orderId, order, units
  - OrderItemUnit
    - id, orderItemId, status, unitIndex, orderItem

- 2026-02-20: Status enums
  - orderStatus: pending | completed | cancelled
  - unitStatus: pending | ready | delivered
  - itemStatus: pending | ready | delivered

- 2026-02-20: Sorting / timestamps contract
  - Canonical time field for kitchen sorting: Order.timestamp.
  - Set via DB default (@default(now())) in Prisma (not app-assigned).
  - Extras orders are separate Order rows and receive their own Order.timestamp from DB.

- 2026-02-20: Endpoint contract (final)
  - Set orderStatus manually:
    - PATCH /api/orders/:id
    - Payload: { "orderStatus": "<status>" }
  - Update a single unit status:
    - PATCH /api/orders/:id
    - Payload: { "unitId": "<unitId>", "unitStatus": "<status>" }
  - Bulk update units for an item:
    - PATCH /api/orders/:id
    - Payload: { "itemId": "<itemId>", "unitStatus": "<status>", "mode": "bulk" }

## Task Closed
Status: DONE
Migration created: YES (202602201553_add_order_item_units)
API contract updated: YES
Repo methods updated: YES