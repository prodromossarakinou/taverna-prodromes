# Sprint — Backend Wireup and Persistence

Sprint Name: backend-wireup-and-persistence  
Sprint Owner: Michael  
Status: Open  
Start: 2026-02-15  
Created: 2026-02-14

## Sprint Goal
Move from UI-only implementation to a working data flow by wiring the UI to backend API endpoints and connecting backend to a local database for persistence.

## Scope
Included:
- Define/freeze minimal API contract for MVP flows
- Connect UI screens to backend (waiter + kitchen)
- Connect backend to database (persistence)
- Basic data model for menu items and orders
- Basic error handling states (loading/empty/error)

Excluded:
- Authentication
- Printing pipeline (unless trivial to add after persistence)
- Advanced analytics
- Complex role management

## Deliverables
- UI reads menu from backend
- UI creates orders via backend
- Kitchen view lists orders from database
- Status updates persist in database
- Fresh restart keeps data (persistence verified)

## Risks
- Contract churn if endpoints are not frozen early
- Local DB schema churn
- UI state handling may regress with real async flows

## Next After Sprint
- Printing integration
- Realtime updates (if needed)
- Operational runbook hardening
