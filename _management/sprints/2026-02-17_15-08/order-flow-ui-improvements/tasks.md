# Sprint Tasks — order-flow-ui-improvements

## Planned

Waiter Order Flow
- Add explicit order start action/state
- Define empty vs active order state UI
- Add waiter-side order review step/state
- Ensure fast return from review to editing

Primary Actions Visibility
- Make submit order button continuously visible
- Make clear/delete order button continuously visible
- Implement sticky action bar
- Verify mobile safe-area behavior

Extras Handling
- Support extras/add-ons per item
- Add UI control for extras selection
- Show extras inline in order summary

Per Item Notes
- Add comment input per order item
- Map comment to extraNotes field
- Support add/edit/remove comment
- Show comment indicator on item row

Order Summary UX
- Improve scroll continuity
- Preserve PDA density
- Maintain touch accessibility

Kitchen Visibility
- Ensure extras and extraNotes visible in kitchen cards

## Definition of Done

- Waiter can start a new order explicitly
- Extras can be added per item
- Per-item comments work end-to-end
- Review step exists before submit
- Primary actions always visible
