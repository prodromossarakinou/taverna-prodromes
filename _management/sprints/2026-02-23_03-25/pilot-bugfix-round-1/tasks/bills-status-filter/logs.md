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
