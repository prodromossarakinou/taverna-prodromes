# Sprint — Database Integration and Data Source Switch

Sprint Name: database-integration-and-data-source-switch  
Sprint Owner: Michael  
Status: OPEN

## Sprint Goal

Move the application from static and mock data sources to full database-backed operation for menu and orders.

All menu and order data must be read from and written to the database.

## Scope

Included:

- Move static menu into database
- Adjust models as required by persistence
- Read menu from DB only
- Read orders from DB only
- Create orders in DB
- Delete orders in DB
- Allow full modification rights (admin mode — temporary)

Excluded:

- Fine-grained role/permission model
- Audit logs
- Printing pipeline
- Analytics

## Deliverables

- Menu fully stored in DB
- No static menu source in runtime flow
- Orders loaded from DB
- Order create persists to DB
- Order delete persists to DB
- Order update persists to DB
- Admin can modify any order (temporary rule)

## Temporary Rule

Current user is treated as admin.  
All operations allowed.

## Risks

- Model changes may require migrations
- Seed data drift risk
- UI assumptions about static menu must be removed