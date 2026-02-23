# bill-actions — Logs

Status: COMPLETED  
Created: 2026-02-23 04:04  
Completed: 2026-02-23 04:04

## Scope
- Add "Close Bill" action directly on each bill card.
- Call `PATCH /api/bills/:id` with `{ status: "closed" }`.
- Update UI instantly; disable the action while processing.

## Implementation
- File: `components/features/billing/BillsList.tsx`
  - Added `Close bill` button rendered only for non-closed bills.
  - On click, sends `PATCH` to `/api/bills/{id}` with body `{ status: 'closed' }`.
  - Optimistically updates local state to reflect the closed status and re-styles the card (green border, badge shows `closed`).
  - Button shows `Closing…` and is disabled while the request is in progress.

## Verification
1. Open `/bills` and locate an `open` bill.
2. Click `Close bill`.
3. Expected: status badge becomes `closed`, border turns green, button disappears; no page reload required.
4. Refresh page to confirm persistence.

## Notes
- Action is idempotent from UI perspective; repeated clicks are prevented while in-flight.
- Server already supports bill updates via `PATCH /api/bills/:id`.

## Commit
- Message: `feat(billing): close bill action`
