# Pilot Report — Day 1 (Live Restaurant Test)

## Context of Real Restaurant Test
The system was used in a real restaurant environment for the first time. This pilot aimed to validate end‑to‑end order flow, bill generation, and live reporting under real operating conditions.

## Carnival Event Conditions
The pilot coincided with a traditional carnival event, resulting in higher than usual traffic and more complex workflows (larger tables, staggered orders, extras, and mid‑service changes).

## First Real Usage
Waiters operated PDAs for ordering and updates. The kitchen dashboard processed item state transitions in real time. Bills were generated and printed via the integrated flow.

## System Stability
The system remained stable throughout service. No crashes were observed on the server or PDAs. Real‑time updates continued to function under load.

## Identified Issues
- Minor workflow frictions when adding extras to already progressed orders
- Some UX affordances needed for rapid table switching
- Clarifications required for “closed vs delivered” status usage

## Next Improvements
- Streamline extras flow to reduce taps during peak times
- Add quick actions for frequent operations on the kitchen and waiter views
- Tighten the status lifecycle to reflect real operational semantics

---

## Live System Snapshot
Source: `/api/report`

Example captured during pilot:

Menu
- Active items: 42
- Total items: 55

Orders
- Total: 52

Status distribution
- completed: 15
- delivered: 18
- started: 10
- closed: 3
- pending: 6

Bills
- Total: 45
- Total amount: 2988.279

Bill status
- open: 45

Generated timestamp: 1771807981656

Production endpoint:
https://taverna-prodromes-68a3161fcaa2.herokuapp.com/api/report

---

## Pilot Result (Conclusion)
The system successfully handled real operational load during a live event. No crashes occurred and the PDA devices remained stable. Identified issues are related to workflow improvements rather than system stability.
