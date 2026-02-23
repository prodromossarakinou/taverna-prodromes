# soft-delete-orders — Logs

Status: OPEN  
Created: 2026-02-23 03:25

## Investigation
- Repro steps:
  1. Delete an order via UI/Admin.
  2. Check DB and UI behavior.
  3. Observe permanent deletion and absence from Kitchen.
- Hypotheses:
  - API delete handler performs hard delete instead of soft delete.
  - Prisma model lacks a `deleted` status or equivalent flag.
  - Kitchen query filters exclude deleted records that should be visible for historical context.

## Findings
- TBD

## Fix
- TBD

## Verification
- TBD
