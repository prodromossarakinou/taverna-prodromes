# Sprint — Kitchen Status Lifecycle and Layout

Sprint Name: kitchen-status-lifecycle-and-layout  
Sprint Owner: Michael  
Status: OPEN

## Sprint Goal

Introduce a full order lifecycle with reversible statuses, unit-level item state persistence, kitchen filtering, and a horizontal-scroll kitchen layout.

## Scope

Included:

- Order status lifecycle: new → started → completed → delivered → closed (all reversible)
- Automatic transitions:
  - any item becomes blue → order becomes started
  - all items become green → order becomes completed
- Manual transitions:
  - delivered, closed (and reversible via Edit)
- Unit-level persistence for item states (quantity splits persisted in DB)
- Kitchen filters (default: new, extra, started; optional: delivered, closed, completed)
- Kitchen layout refactor: horizontal list (x-scroll) of order cards
- Order card header shows: time + waiter + table + extra badge
- Status-driven header + border coloring

Excluded:

- Printing pipeline changes
- Auth/roles enforcement
- Analytics/reporting

## Deliverables

- DB schema updated for unit-level item states
- API supports updating:
  - unit states
  - order status (manual overrides)
- Kitchen UI:
  - horizontal scroll list of orders
  - per-item expand into units when quantity > 1
  - filter bar with default toggles
  - edit mode to change anything
- Status colors applied consistently to border + header

## Risks

- Schema/migration complexity (unit-level persistence)
- Realtime/list refresh correctness after updates
- UI complexity in edit mode