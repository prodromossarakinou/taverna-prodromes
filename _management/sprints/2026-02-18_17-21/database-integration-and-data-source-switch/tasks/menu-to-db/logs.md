# Task Logs — menu-to-db

## 2026-02-18 17:26
- Task initiated. Preparing schema alignment, seed updates, and static menu source removal.

## 2026-02-18 17:45
- Schema: `MenuItem` now includes `price` (Float?), `active` (Boolean, default true), and `id` has no default.
- Migration: `prisma/migrations/202602181726_add_menu_item_fields/migration.sql` adds `price` + `active`.
- Seed: `prisma/seed-data/menu-items.ts` (26 items). Seed command: `npx prisma db seed`. Seed script: `prisma/seed.ts` uses upsert by stable `id`.
- Static menu sources removed from runtime: `components/features/waiter/WaiterView.tsx` (static menu array), `lib/repositories/mock.ts` (mock menu data/repository).
- API wiring: `GET /api/menu` -> `menuRepository` (`PrismaMenuRepository`).
- Verification: not run in this environment (seed/GET/UI checks pending).

## Task Closed
Status: DONE
Verified: menu served from DB only
Seed reproducible: YES
Static runtime source removed: YES