# bills-status-filter — Logs

Status: OPEN  
Created: 2026-02-23 03:25

## Investigation
- Repro steps:
  1. Open Bills list.
  2. Attempt to filter by status.
  3. Observe no filter or non-functional controls.
- Hypotheses:
  - API `/api/bills` lacks `status` query parsing.
  - UI missing filter controls or state wiring.
  - Repository `listBills` does not accept status condition.

## Findings
- TBD

## Fix
- TBD

## Verification
- TBD

# bills-status-filter — Logs

Status: OPEN  
Created: 2026-02-23 03:53

## Investigation
- There is no dedicated Bills list UI yet; API exists: `GET /api/bills` with optional `status` filter on the server side.
- Requirement focuses on client-side filtering first (keep schema as-is, lightweight interaction).

## Implementation
- Added a lightweight Bills page with client-side status filters (All/Open/Closed):
  - New component: `components/features/billing/BillsList.tsx`
    - Fetches `/api/bills` once, default-sorts by `createdAt` desc for stable navigation.
    - Local filter state: `all | open | closed` (default `all`).
    - Derived `filteredBills` computed in-memory; no re-fetch on toggle.
    - UI control: compact buttons near header, aligned with project styling.
    - Preserves scroll area (list container stable; only derived array changes).
  - New route page: `app/bills/page.tsx` to render the list.

## Verification
1. Create multiple bills; close a subset.
2. Open `/bills`.
3. Toggle filters: All → Open → Closed.
4. Expected:
   - Subsets match selected filter accurately.
   - No UI flicker, scroll position preserved.
   - List sorting remains by `createdAt` desc.

## Notes
- Server already supports `status` filtering via query, but per scope we keep it client-side initially.
- Ready for future search integration (filter logic coexists with search predicate).
