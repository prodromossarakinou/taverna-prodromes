# Sprint Logs — live-data-and-realtime-kitchen

Derived from task-level logs and _progress monthly logs.

Προορίζεται για τον Michael — σύνοψη sprint επιπέδου.

## Scope covered
- DB runtime data for Menu/Orders via API (DB-backed repositories).
- Order creation persists to DB, including extras metadata.
- Kitchen realtime monitoring via polling (decoupled from UI refresh) with update notification.

## Tasks touched
- db-runtime-enforcement (completed).
- kitchen-realtime-listener (completed).
- realtime-consistency-validation (completed).

## Components changed
- contexts/OrderContext.tsx (orders/menu fetched from API, mutations via API)
- app/api/menu (DB-backed CRUD)
- app/api/orders (DB-backed CRUD + extras metadata)
- lib/repositories/prisma.ts (DB source of truth)
- prisma/schema.prisma (order extras fields)
- components/features/kitchen/KitchenDisplay.tsx (polling + update notification + manual refresh)

## Behavior changes
- Runtime menu and orders are sourced from DB via API.
- New orders are persisted in DB (including `isExtra` and `parentId`).
- Mock/in-memory orders are no longer the runtime source of truth.
- Kitchen polling checks for updates every 30s without auto-refreshing the list.
- Pending updates trigger a top-left notification with manual refresh action.
- Deterministic ordering (timestamp ASC + id ASC) and stable merge guard reduce duplicates/flicker.

## Open items
- None (sprint closed).

## Verification
- Completed: testing confirms DB-only runtime, polling + notification behavior, deterministic merge, and consistency under normal operational load.
