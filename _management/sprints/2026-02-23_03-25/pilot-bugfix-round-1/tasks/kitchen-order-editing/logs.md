# kitchen-order-editing — Logs

Status: OPEN  
Created: 2026-02-23 03:25

## Investigation
- Repro steps:
  1. Open Kitchen view for an active table.
  2. Attempt to remove items, adjust quantities, and rename table.
  3. Observe which actions are unsupported or non-persistent.
- Hypotheses:
  - Kitchen UI lacks editing controls and form state.
  - API endpoints for item removal/quantity update/table rename are missing or restricted.
  - Prisma write paths exist but are not wired from Kitchen.

## Findings
- TBD

## Fix
- TBD

## Verification
- TBD
