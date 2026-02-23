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

# kitchen-order-editing — Logs

Status: OPEN → COMPLETED  
Updated: 2026-02-23 04:32

## Goal
Kitchen must be able to correct an order without deleting it.

## Scope Implemented
- Edit from Kitchen card via a popup: table rename, status change, and item removal.
- Server-persisted changes; no local-only state.
- Read-only safety for `closed` and `deleted` orders.
- UI indicator `EDITED` appears on the order card after a successful edit.

## Implementation Details
### Backend
- `lib/repositories/prisma.ts`
  - Added helpers with read-only guard:
    - `updateOrderTableNumber(orderId, tableNumber)` → PATCH rename table.
    - `updateOrderWaiterName(orderId, waiterName)` → PATCH waiter name.
    - `removeOrderItem(orderId, itemId)` → transactional delete of units then item.
  - Introduced `mapDbOrder()` to normalize DB → API shape.
- `app/api/orders/[id]/route.ts`
  - Extended PATCH to accept:
    - `{ waiterName: string }` → update waiter name (non-empty)
    - `{ tableNumber: string }` → rename table
    - `{ removeItemId: string }` → remove item
  - Returns 400 for read-only orders and 404 for missing items.

### Frontend
- `contexts/OrderContext.tsx`
  - Added context methods:
    - `renameOrderTable(orderId, tableNumber)`
    - `renameWaiter(orderId, waiterName)`
    - `removeOrderItem(orderId, itemId)`
  - All call PATCH and refresh orders.
- `components/features/kitchen/OrderCard.tsx`
  - Edit popup accessed from `Edit` button.
  - Popup sections:
    - Waiter name (free-text) + Save
    - Table name/number + Save
    - Order status select + Save
    - Items list with `Remove` per row
  - Disabled controls when order is `closed` or `deleted`.
  - Shows `EDITED` label after successful change.
  - Inline editors removed: waiter/status editing happens only inside the popup.

## Safety Rules
- Server rejects edits on `closed` or `deleted` orders with `ORDER_READ_ONLY` → mapped to 400.

## Verification
1. Create a new order with 2+ items.
2. In Kitchen, click `Edit` on the order card → popup opens.
3. Change table (e.g., `Table 5 → Table 7`) → Save → card updates; persists after reload.
4. Remove one item → list updates; persists after reload.
5. Change status (e.g., `new → started`) → Save → reflected on card.
6. Close the order and try editing again → controls disabled (read-only).

## Notes
- Bill creation flow unchanged; soft-delete and auto-close behaviors remain intact.

## Commit
Message: `feat(kitchen): move status editing to popup; add waiterName editing`
