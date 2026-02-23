# billing-avoid-duplicate-table-merge — Logs

Status: OPEN  
Created: 2026-02-23 04:45

## Problem
When creating a bill, different base orders that merely share the same `tableNumber` were merged into a single bill. This is incorrect and causes cross-order contamination.

## Expected
- A bill must be scoped to a single base (non-extra) order, plus its extras where `isExtra = true` and `parentId` equals the base order id.
- Do not merge unrelated base orders even if they have the same `tableNumber`.

## Implementation
### Server (Repository)
- File: `lib/repositories/prisma.ts`
  - `PrismaBillRepository.createBill`
    - Enforce a single root base order: take the first `baseOrderIds[0]`.
    - Validate it is non-extra and has no `parentId`.
    - Derive extras strictly via `parentId = rootBaseOrderId` and `isExtra = true`.
    - Duplicate-prevention checks now use the final computed sets: `[root] + derivedExtras`.
    - Snapshot, subtotals, and persisted arrays now use `[root]` for `baseOrderIds` and the derived extras for `extraOrderIds`.
  - `PrismaBillRepository.updateBill`
    - When `baseOrderIds` is provided, treat the first element as the root and re-derive extras by `parentId`.
    - Recompute items and totals from the root + derived extras only.
    - Ignore arbitrary `extraOrderIds` changes without a root base (keeps existing extras).

### Client (UI)
- File: `components/features/kitchen/KitchenDisplay.tsx`
  - Bill popup now selects a specific BASE order (non-extra) per table.
  - Aggregation preview (`buildBillFromBase`) shows that base order and its derived extras only.
  - Existing-bill detection picks the bill whose `baseOrderIds` includes the selected base id.
  - POST/PATCH payloads send `baseOrderIds=[baseId]` and `extraOrderIds` derived from `parentId`; server enforces the same rule.

## Edge Cases
- Extras with `isExtra=true` but missing `parentId` are excluded from aggregation and can be logged separately for data hygiene.
- Deleted orders remain blocked from billing.
- Multiple bills per `tableNumber` are allowed when they correspond to different base roots.

## Verification
1) Create two base orders on the same `tableNumber` (A and B).
2) Create extras for A only (parentId=A.id). Leave B without extras.
3) In Kitchen bill popup, pick base A → aggregation includes A + A’s extras. Create bill → success.
4) Pick base B → aggregation includes only B. Create second bill → success.
5) Confirm neither bill includes the other base, and refresh does not merge across bases.

## Commit
`fix(billing): prevent merging bills across unrelated tables with same name`
