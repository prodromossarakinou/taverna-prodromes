# Sprint Tasks — bill-calculation-popup

## Planned

UI Entry
- Add top-left button: Bill / Λογαριασμός
- Open popup/sheet on click

Table Selection
- Fetch available open tables from DB/orders
- Show selectable list (table number + status)
- If no tables: show empty state

Bill Aggregation
- For selected table:
  - include base order
  - include all extras (isExtra=true, parentId or same table mapping)
- Provide breakdown:
  - Base items
  - Extras items (grouped by extra ticket/time)

Totals
- Line totals per item (qty * price)
- Section totals (Base / Extras)
- Grand total
- Handle missing prices safely (treat as 0 and flag in UI)

Verification
- Cross-check totals against menu prices
- Confirm extras inclusion for table

## Definition of Done
- Bill popup works end-to-end
- Correct aggregation of base + extras
- Totals correct and stable
