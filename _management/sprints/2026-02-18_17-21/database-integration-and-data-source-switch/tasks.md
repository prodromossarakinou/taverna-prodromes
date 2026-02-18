# Sprint Tasks — database-integration-and-data-source-switch

## Planned

Menu Migration
- Move static menu dataset into database
- Update Prisma schema if needed
- Add/adjust MenuItem fields
- Create seed script for menu
- Remove static menu usage in code paths

Menu Data Source Switch
- API GET /api/menu reads from DB only
- No mock/static fallback
- Validate category and price fields

Orders — DB Backing
- Ensure all orders read from DB
- Create order → DB insert
- Delete order → DB delete
- Update order → DB update
- Extras orders persist correctly

API Layer
- Verify repositories use Prisma only
- Remove mock repositories from runtime wiring
- Validate payload → DB mapping

Admin Capability (Temporary)
- Allow update/delete for all orders
- No permission checks (temporary admin mode)

Verification
- Restart server → data persists
- Create/delete/update reflected after reload
- Menu loads without static files

## Definition of Done

- No static menu in runtime
- Menu served from DB
- Orders fully DB-backed
- CRUD works end-to-end
- Seed script reproducible