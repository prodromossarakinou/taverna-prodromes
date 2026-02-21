# Task Log — Bill Breakdown and Totals

## 2026-02-21 15:46
- Planned breakdown structure: Base items, Extras grouped by ticket/time, line totals (qty*price), section totals, grand total. Missing prices flagged.

## 2026-02-21 16:06
- Implemented bill aggregation in `WaiterView`:
  - Fetch all related orders for selected table; partition into Base (`!isExtra && !parentId`) and Extras (`isExtra === true || parentId != null`).
  - Line totals per item: `quantity * price` (price from `menuItems` by `id`).
  - Section totals: `baseTotal`, `extrasTotal`; `grandTotal = base + extras`.
  - Missing price handling: treat as 0, log `console.warn`, visually mark item with `NO PRICE` badge.
- Added UI layout in Bill popup: Base list, Extras list, divider, and sticky Totals area always visible.
