# Sprint Tasks — kitchen-status-lifecycle-and-layout

## Planned

Data Model / DB
- Add order-level status field (new/started/completed/delivered/closed)
- Add unit-level item state persistence
  - Represent quantity as units with per-unit status
- Ensure createdAt stored in DB and used for display/sorting
- Ensure isExtra and parentId remain supported

API / Repositories
- Update Prisma schema + migrations
- Update repositories to support:
  - fetch orders with unit states
  - update unit state(s)
  - update order status (manual override)
- Extend PATCH endpoints to support:
  - set unit state by unit id
  - bulk update (optional)
  - set order status explicitly (edit mode)

Kitchen UI — Layout
- Replace grid with horizontal scroll order list
- Each order card supports vertical scroll internally
- Preserve oldest-first sorting

Kitchen UI — Filters
- Filter bar with toggles
- Default visible: new, extra, started
- Optional enable: completed, delivered, closed
- Persist filter state locally

Kitchen UI — Unit Expansion
- If quantity > 1:
  - click item expands to unit rows (x1)
  - unit rows individually toggle state
  - when all units reach same target state → parent reflects and auto-collapses
- Show partial state indicator when mixed

Edit Mode
- Add "Edit" action per order
- In edit mode:
  - all statuses reversible
  - allow changing order status
  - allow changing any unit state
  - allow correcting waiter/table if needed (if fields exist)

Styling
- Status color mapping:
  - new: dark gray
  - extra: orange
  - started: blue
  - completed: green
  - delivered: purple
  - closed: light blue
- Apply to order header + border
- Use tokens (globals.css), not hardcoded ad-hoc styles

## Definition of Done

- Unit-level state persisted in DB and rendered correctly
- Status lifecycle works (auto + manual) and fully reversible
- Kitchen list is horizontal scroll, not grid
- Filters work with correct defaults
- Order header displays time + waiter + table
- Status colors applied consistently