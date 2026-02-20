# Sprint Tasks — live-data-and-realtime-kitchen

## Planned

Data Source Unification
- Menu uses DB-only runtime data
- Orders use DB-only runtime data
- Remove static or mock runtime sources
- Ensure no in-memory-only list is source of truth

Realtime Kitchen Updates
- Subscribe kitchen view to live updates
- Handle new order insertion
- Handle order updates
- Handle order deletions
- Handle extras order insertions
- Update list without manual refresh

Sorting & Consistency
- Maintain oldest-first sorting
- Preserve deterministic order after updates
- Prevent duplicates
- Avoid stale entries
- Avoid flicker during updates
- Keep extras as separate tickets

## Definition of Done

- Menu and orders are DB-backed at runtime
- Kitchen view receives live updates and auto-refreshes
- Oldest-first sorting is deterministic after updates
- No duplicate or stale tickets observed
- Extras remain separate tickets
