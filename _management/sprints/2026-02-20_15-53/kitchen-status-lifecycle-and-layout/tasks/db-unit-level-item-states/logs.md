# Task Logs — db-unit-level-item-states

Status: OPEN
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