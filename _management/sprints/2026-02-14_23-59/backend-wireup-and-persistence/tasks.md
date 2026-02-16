# Sprint Tasks — backend-wireup-and-persistence

## Planned

API / Contract
- [x] Define minimal entities: MenuItem, Order, OrderItem, Status
- [x] Freeze routes and payloads for:
  - [x] GET menu
  - [x] POST order
  - [x] GET orders (kitchen/pass)
  - [x] PATCH order status

Backend
- [x] Implement API handlers for the above routes
- [x] Add validation for payloads (minimum viable)
- [x] Add error responses with consistent shape

Database
- Choose and wire local persistence (e.g., SQLite)
- Define schema/migrations
- Persist menu and orders
- Verify restart persistence

UI Wireup
- Replace static UI data with API fetches
- Implement loading/empty/error states
- Wire order creation flow end-to-end
- Wire kitchen order list and status transitions

Testing / Verification
- Manual E2E run on LAN (browser client)
- Verify persistence after server restart
- Verify basic error handling

## Completed
- UI corrections only (from previous sprint work)
