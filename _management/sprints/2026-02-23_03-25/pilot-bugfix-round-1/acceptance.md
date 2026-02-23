# Acceptance — Pilot Bugfix Round 1

Sprint is complete when all of the following are true:

- Kitchen shows all orders (no artificial 10-order cap).
- Bills have status filtering (All, Open, Closed).
- Orders close automatically when a bill is created (`order.status = closed`).
- Deletion becomes soft delete (`status = deleted`), and Kitchen can still view them as needed.
- Kitchen editing works (remove items, adjust quantities, rename table) to reflect real operational needs.
- Bill search works (by Table, Name, Order id).

Verification approach per task must be logged under each task’s `logs.md` and include:

- Reproduction steps
- Root cause analysis summary
- Fix description
- Screenshots or console/API evidence where applicable
- Post-fix validation steps and results
