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

# auto-close-order-on-bill — Logs

Status: IN PROGRESS  
Created: 2026-02-23 03:35

## Investigation
- Goal: After a bill is created, all participating orders must automatically transition to `status = closed`.
- Entry point for bill creation: `app/api/bills/route.ts` → delegates to `billRepository.createBill()`.
- Repository implementation: `lib/repositories/prisma.ts` → `PrismaBillRepository.createBill` handles duplicate checks, snapshot computation, and persistence.

## Findings
- Orders involved in a bill are known at creation time via `baseOrderIds` and `extraOrderIds`.
- Kitchen/Waiter UI reads orders from `/api/orders` (see `contexts/OrderContext.tsx`), so updating order status in DB will be reflected on next refresh.

## Implementation
- Centralize the behavior in the repository to keep API route thin and ensure consistent behavior regardless of caller.
- File changed: `lib/repositories/prisma.ts`
- Method: `PrismaBillRepository.createBill`
- Change: After `prisma.bill.create(...)`, run an idempotent `updateMany` to set `status='closed'` for all `baseOrderIds ∪ extraOrderIds` that are not already closed.

### Code excerpt
```ts
// After bill creation
try {
  const affectedOrderIds = [...new Set([...(baseOrderIds ?? []), ...(extraOrderIds ?? [])])];
  if (affectedOrderIds.length > 0) {
    await prisma.order.updateMany({
      where: { id: { in: affectedOrderIds }, NOT: { status: 'closed' } },
      data: { status: 'closed' },
    });
  }
} catch (e) {
  console.error('Auto-close orders after bill creation failed:', e);
}
```

## Edge Cases Considered
- Orders already `closed`: safely skipped via `NOT: { status: 'closed' }`.
- Extras linked to the same bill: included through `extraOrderIds`.
- Partial bill updates: out of scope for creation; `PATCH /api/bills/:id` recalculation remains unchanged.
- Failure to close orders: does not fail bill creation; logs error for follow-up.

## Verification Plan
1) Create a new order with items.
2) Create a bill via `POST /api/bills` including that order ID.
3) Verify the order now has `status = closed` via `/api/orders` or UI (Kitchen reflects closed status on refresh).
4) Confirm bill is still printable via `/api/bills/:id/print`.

## Status
- Implementation committed locally; pending final confirmation post-push.
