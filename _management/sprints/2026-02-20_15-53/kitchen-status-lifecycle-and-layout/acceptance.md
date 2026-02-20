# Sprint Acceptance — kitchen-status-lifecycle-and-layout

Sprint is accepted when all are true:

Data / DB
- Order status persisted in DB
- Unit-level item states persisted in DB
- Migrations applied successfully
- createdAt used as canonical time source

Behavior
- Any item becomes blue → order status becomes started (unless manually overridden in edit mode)
- All items green → order status becomes completed (unless manually overridden in edit mode)
- delivered and closed are manual and reversible
- Edit mode exists and allows changing anything (status + units)

Kitchen UI
- Horizontal scroll order list implemented
- Each order card shows: time (HH:mm), waiter, table, extra badge if isExtra
- Quantity > 1 expands into unit rows, each independently stateful
- Auto-collapse when units reach unified state
- Filters default to: new, extra, started; can enable completed/delivered/closed
- Status color mapping applied to border + header via tokens

Sprint status: OPEN  
Acceptance owner: Michael