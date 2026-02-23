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
- Root cause is a hard client-side cap in the Kitchen UI.
- File: `components/features/kitchen/KitchenDisplay.tsx`
- Code before:
  ```ts
  const filteredOrders = useMemo(() => {
    return categoryFilteredOrders.slice(0, 10);
  }, [categoryFilteredOrders]);
  ```
- This `slice(0, 10)` limited the rendered list to the first 10 orders after filters.

## Fix
- Removed the hard limit so all filtered orders render.
- New code:
  ```ts
  const filteredOrders = useMemo(() => {
    // Show all orders that match the active filters. Previously this view was hard-capped to 10.
    // If performance becomes an issue with very large lists, consider list virtualization.
    return categoryFilteredOrders;
  }, [categoryFilteredOrders]);
  ```
- No API/repository changes required; this was UI-only.

## Verification
- Seed/create >10 active orders spanning multiple categories.
- Open Kitchen view with default filters.
- Expected: More than 10 orders are visible; scrolling reveals all orders.
- Sanity: Toggle category/status filters — list updates but does not re-cap at 10.
- Regression: Printing popup, menu PDF, and bill calculations unaffected.
