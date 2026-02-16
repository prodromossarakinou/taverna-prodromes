# 100 Days Challenge — AI-Assisted Software Delivery

Copyright © 2026 Prodromos Sarakinou. All rights reserved.

Owner: Prodromos Sarakinou  
Project Management: Michael  
UI/UX Lead: Alexander

This repository (or repository group) is developed under a **100 Days Challenge** model.  
The challenge focuses on continuous, daily, measurable delivery using AI-assisted development, strict documentation discipline, and structured progress tracking.

Multiple projects may be executed under this challenge. The order system is one of them, not the only one.

---

## Challenge Model

Duration: 100 consecutive days  
Rule: Every day must produce measurable, documented progress.

Valid daily progress includes:

- Feature delivery
- Bug fixes
- Refactors with behavioral impact
- UI/UX improvements
- Build and dependency stabilization
- Architecture and infrastructure work
- Printing / device integrations
- Performance improvements
- Documentation and runbooks
- Sprint and progress records

Progress must be commit-backed and logged.

---

## Project Scope Model

The challenge can include multiple parallel or sequential projects, for example:

- Local order systems
- Admin dashboards
- Operational tools
- Device-integrated apps
- Internal platforms
- UI/UX systems
- API services

Each project must define its own:

- README
- Scope
- Acceptance criteria
- Sprint structure

---

## Technology Approach

Projects may use different stacks. Typical patterns:

- Next.js / Web platforms
- Local-first architectures
- AI-assisted code generation
- Design-system-driven UI
- LAN or offline-capable systems

Stack choice is project-specific, not challenge-wide.

---

## Progress Tracking Standard

All meaningful commits must be documented.

Structure:

_progress/<year-month>/<commit-revision>.md

Monthly summary:

_progress/<year-month>/README.md

Rules:

- One file per commit
- Structured format required
- Documentation only inside `_progress`
- Append-only history

See `_progress/README.md` for format specification.

---

## Sprint Management Standard

All sprint work is tracked under:

_management/sprints/<YYYY-MM-DD_HH-mm>/<sprint-name>/

Each sprint contains:

- README.md
- tasks.md
- acceptance.md

Sprint files are created at sprint start and updated through commits.

---

## Definition of Challenge Success

The 100 Days Challenge is successful when:

- Continuous daily progress is maintained
- Each project has reproducible setup documentation
- Progress is fully traceable through `_progress`
- Sprint history is recorded
- Deliverables reach functional stability
- Documentation quality supports handover

---

## Roles

Owner — scope authority and final acceptance  
Michael — project management and documentation governance  
Alexander — UI/UX authority and design standards

---

## API Specification (MVP)

### Endpoints

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/api/menu` | List all menu items |
| `GET` | `/api/orders` | List all orders (most recent first) |
| `POST` | `/api/orders` | Create a new order |
| `PATCH` | `/api/orders/:id` | Update order status or item status |

### Data Shapes

#### MenuItem
```typescript
interface MenuItem {
  id: string;
  name: string;
  category: 'Κρύα' | 'Ζεστές' | 'Ψησταριά' | 'Μαγειρευτό' | 'Ποτά';
  price?: number;
  extraNotes?: string;
}
```

#### Order
```typescript
interface Order {
  id: string;
  tableNumber: string;
  waiterName: string;
  items: OrderItem[];
  timestamp: number; // ms
  status: 'pending' | 'completed' | 'cancelled';
  extraNotes?: string;
}
```

#### OrderItem
```typescript
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  category: OrderCategory;
  itemStatus: 'pending' | 'ready' | 'delivered';
  extraNotes?: string;
}
```

### Payloads

#### Create Order (`POST /api/orders`)
```json
{
  "tableNumber": "5",
  "waiterName": "Γιώργος",
  "items": [
    {
      "id": "temp-1",
      "name": "Μπριζόλα Χοιρινή",
      "quantity": 2,
      "category": "Ψησταριά",
      "itemStatus": "pending"
    }
  ]
}
```

#### Update Order Status (`PATCH /api/orders/:id`)
```json
{
  "status": "completed"
}
```

#### Update Item Status (`PATCH /api/orders/:id`)
```json
{
  "itemId": "item-1",
  "itemStatus": "ready"
}
```

---

## Database Connection Details

For development and MVP integration, the PostgreSQL database is provisioned via Docker.

### PostgreSQL
- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `appdb`
- **User:** `appuser`
- **Password:** `apppass`
- **Connection String:** `postgresql://appuser:apppass@localhost:5432/appdb`

### pgAdmin (Web Interface)
- **URL:** `http://localhost:5050`
- **Username:** `admin@example.com`
- **Password:** `adminpass`

---

## Legal Notice

All code, documentation, structures, and specifications in this challenge are owned by:

Prodromos Sarakinou

Unauthorized redistribution or reuse outside explicit permission is not allowed.

