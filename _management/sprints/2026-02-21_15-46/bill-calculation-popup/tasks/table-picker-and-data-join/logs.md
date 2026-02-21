# Task Log — Table Picker and Data Join

## 2026-02-21 15:46
- Defined requirement: list open tables from Orders (status not closed) and include mapping to extras by tableNumber/parentId.

## 2026-02-21 16:06
- Implemented Bill popup table selector (open tables only) derived from `/api/orders` via `OrderContext`.
- Open table definition: any order where status is not `completed` or `cancelled`.
- Displayed per-table: table number, active order count, extras indicator.
- Sorting ascending by numeric table number (fallback to lexical if not numeric).
- Added loading and empty states. No crash on empty response.
