# Sprint — Order Flow UI Improvements

Logging status: COMPLETE
Sprint summary log: logs.md

Sprint Name: order-flow-ui-improvements  
Sprint Owner: Michael  
Status: OPEN

## Sprint Goal

Improve the waiter order-taking flow with continuous primary actions, per-item notes, and clearer operational flow for order start, extras handling, and waiter-side order review.

## Scope

Included:

- UI improvements in order-taking flow
- Continuous visibility of submit / clear order actions
- UX continuity during scrolling
- Add per-item comment field mapped to extraNotes
- Improve visual feedback during item selection
- Explicit order start flow for waiter
- Extras handling flow per item
- Waiter-side order review before submit

Excluded:

- Printing logic
- Auth or role logic
- Non-order UI areas

## Deliverables

- Submit and Clear Order buttons remain visible
- Sticky action bar in order summary
- Explicit “start order” state for waiter
- Extras/add-ons flow supported per item
- Per-item comment mapped to extraNotes
- Waiter review screen/state before final submit
- PDA-friendly density preserved

## Risks

- Added steps must not slow down fast ordering
- Extras UX must stay one-tap or near one-tap

## Acceptance Target

Waiter can start order, add items with extras and notes, review order, and submit — without losing access to primary actions.
