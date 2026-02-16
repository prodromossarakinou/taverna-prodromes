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
- [x] Choose and wire local persistence (e.g., SQLite) -> **PostgreSQL chosen**
- [x] Define schema/migrations
- [x] Persist menu and orders
- [x] Verify restart persistence

UI Wireup
- [x] Replace static UI data with API fetches
- [x] Implement loading/empty/error states
- [x] Wire order creation flow end-to-end
- [x] Wire kitchen order list and status transitions

Testing / Verification
- Manual E2E run on LAN (browser client)
- Verify persistence after server restart
- Verify basic error handling

## Completed
- UI corrections and modularization (Waiter/Kitchen views)
- API Layer implementation (Menu, Orders, Status updates)
- PostgreSQL provisioning via Docker
- Prisma ORM integration and schema setup
- Menu seeding (26 items)
- Full support for `extraNotes` across DB and UI
- Verification of end-to-end data flow (Waiter -> DB -> Kitchen)
