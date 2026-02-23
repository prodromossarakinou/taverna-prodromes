# bill-search — Logs

Status: OPEN  
Created: 2026-02-23 03:25

## Investigation
- Repro steps:
  1. Open Bills list view.
  2. Try searching by table number, customer name, and order id.
  3. Observe missing or non-functional search capability.
- Hypotheses:
  - API `/api/bills` lacks query parameters for `table`, `name`, `orderId`.
  - DB query does not index/search across relevant fields.
  - UI lacks a search input and debounce/query wiring.

## Findings
- TBD

## Fix
- TBD

## Verification
- TBD
