# auto-close-order-on-bill — Logs

Status: OPEN  
Created: 2026-02-23 03:25

## Investigation
- Repro steps:
  1. Create an order, keep it open.
  2. Create a bill via `POST /api/bills` including that order.
  3. Check the order status.
  4. Observe it remains not closed.
- Hypotheses:
  - `createBill` repository path does not update related `Order` records.
  - Missing transactional update to set `status = closed`.

## Findings
- TBD

## Fix
- TBD

## Verification
- TBD
