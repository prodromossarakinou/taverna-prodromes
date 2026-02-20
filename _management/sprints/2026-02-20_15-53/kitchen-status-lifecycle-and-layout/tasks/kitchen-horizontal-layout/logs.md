# Task Logs — kitchen-horizontal-layout

Status: OPEN
Owner: Michael

## Log

- 2026-02-20: Task opened.
- 2026-02-20: Task started (post db-unit-level-item-states close).
- 2026-02-20: Data mapping confirmed in KitchenDisplay.
  - KitchenDisplay now maps order data to include: orderStatus (from status), isExtra, createdAt (from timestamp), waiterName, tableNumber, items with units.
  - Update signature + sorting now based on createdAt/orderStatus mapping before layout changes.
- 2026-02-20: Replaced grid with horizontal scroll list.
  - Container is flex-row with overflow-x and no wrapping.
  - Order cards use fixed min width and internal vertical scroll to keep headers visible.
  - Oldest-first sorting retained via createdAt mapping.