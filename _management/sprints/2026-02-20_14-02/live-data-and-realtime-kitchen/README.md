# Sprint — Live Data and Realtime Kitchen

Logging status: IN PROGRESS
Sprint summary log: logs.md

Sprint Name: live-data-and-realtime-kitchen  
Sprint Owner: Michael  
Status: OPEN

## Sprint Goal

All runtime data comes from the database, with the kitchen screen receiving live updates from database changes without manual refresh.

## Scope

Included:

- Menu data sourced only from the database at runtime
- Orders data sourced only from the database at runtime
- Kitchen view receives live updates for order changes
- Updates respond to new order insertions, updates, deletions, and extras order insertions
- Oldest-first sorting with deterministic ordering after updates
- State consistency without duplicates, stale entries, or flicker
- Extras remain separate tickets

Excluded:

- Non-kitchen view realtime enhancements beyond required scope
- Auth, role, or access control changes
- Printing or reporting changes

## Deliverables

- Menu uses DB-only runtime data
- Orders use DB-only runtime data
- Kitchen view subscribes to live updates (polling or realtime transport)
- List auto-updates without reload
- Stable ordering and consistent ticket state

## Risks

- Realtime updates can introduce flicker or duplicate entries
- Polling may miss rapid updates without adequate cadence

## Acceptance Target

Kitchen view reflects database changes in near real time with deterministic ordering and no stale or duplicate tickets.
