# kitchen-order-limit — Logs

Status: OPEN  
Created: 2026-02-23 03:25

## Investigation
- Repro steps:
  1. Open Kitchen view.
  2. Seed/create >10 active orders.
  3. Observe only the first 10 are rendered.
- Hypotheses:
  - Client-side pagination or `slice(0,10)` left over from earlier UI.
  - API list endpoint defaults to `limit=10`.
  - Prisma query has `take: 10`.

## Findings
- TBD

## Fix
- TBD

## Verification
- TBD
