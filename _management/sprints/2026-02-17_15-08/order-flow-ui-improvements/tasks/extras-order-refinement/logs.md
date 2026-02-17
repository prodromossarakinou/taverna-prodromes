# Task Logs — extras-order-refinement

## 2026-02-17 16:15
- Introduced `originalItems` state in `WaiterView.tsx` to store base order as a read-only reference during `extras` mode.
- Modified state management to reset `currentOrder` to empty when entering `extras` mode to only capture newly added items.
- Updated `submitOrder` handler to only include contents of `currentOrder` (the new extras) in the payload for `extras` mode.
- Ensured that `isExtra` flag and `parentId` are correctly set for extras orders.
- Excluded original order-level notes from the new extras ticket.
- Updated `OrderSummary.tsx` to display original items in a separate, read-only section with a label.
- Added visual separation between "Original Order" and "New Extras" in the summary panel.
