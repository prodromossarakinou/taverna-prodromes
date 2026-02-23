# soft-delete-orders — Logs

Status: COMPLETED  
Created: 2026-02-23 04:04  
Completed: 2026-02-23 04:04

## Goal
Orders must never be hard deleted. They should change status to `deleted` and remain visible in history.

## Scope Delivered
- DB/Model: Added new order status `deleted` to `OrderStatus`.
- Delete action: Converted hard delete to soft delete by updating `order.status = 'deleted'` (no data loss).
- Kitchen view:
  - Added high-level filter control: `Active | Closed | Deleted | All` (default: Active).
  - Deleted orders only appear in `Deleted` and `All` views.
  - Deleted orders are visually muted (reduced opacity + grayscale).
- Bills safety:
  - Creating a bill fails with 400 when any referenced order is `deleted`.
  - Updating a bill with refreshed order IDs fails with 400 if any referenced order is `deleted`.

## Files Changed (highlights)
- `types/order.ts`
  - Added `'deleted'` to `OrderStatus` union.
- `lib/repositories/prisma.ts`
  - `PrismaOrderRepository.deleteOrder` now updates `status: 'deleted'` (soft delete).
  - `PrismaBillRepository.createBill` throws `ORDER_DELETED` if any referenced order is deleted.
  - `PrismaBillRepository.updateBill` throws `ORDER_DELETED` when refreshing with deleted orders.
- `app/api/bills/route.ts`
  - Maps `ORDER_DELETED` to `400` with clear error message.
- `app/api/bills/[id]/route.ts`
  - Maps `ORDER_DELETED` to `400` during bill updates.
- `components/features/kitchen/KitchenDisplay.tsx`
  - Added top-level `viewFilter` state and UI (Active/Closed/Deleted/All), applied in list filtering.
- `components/features/kitchen/OrderCard.tsx`
  - Muted styling for deleted orders: `opacity-60 grayscale`.

## Verification
1. Create several orders; delete one from Kitchen → it becomes `deleted` and disappears from Active, visible in Deleted/All with muted style.
2. Attempt to create a bill including a deleted order → API returns 400 `Cannot create a bill for deleted orders`.
3. Attempt to update an existing bill to include a deleted order (refresh order IDs) → API returns 400 `Cannot update bill with deleted orders`.
4. Non-deleted orders unaffected; closed behavior unchanged.

## Commit
- Message: `feat(orders): implement soft delete with deleted status`
