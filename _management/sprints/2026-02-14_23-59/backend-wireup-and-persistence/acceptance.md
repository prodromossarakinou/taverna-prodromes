# Sprint Acceptance — backend-wireup-and-persistence

Sprint is accepted when all are true:

- UI fetches menu from backend (no static menu source in primary flow)
- UI can create an order via backend and receives confirmation
- Orders are persisted in database
- Kitchen/pass view reads orders from database
- Status updates persist and remain after server restart
- Error states exist for at least: loading, empty, failed request
- Basic payload validation prevents malformed orders from being stored

Sprint status: OPEN
Acceptance owner: Michael
