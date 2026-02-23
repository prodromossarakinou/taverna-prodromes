### System Overview

The system is a Next.js (App Router) application for taverna order management with three main surfaces: Waiter (order taking), Kitchen (execution/monitoring and bill calculation), and Admin (menu management). It includes a full flow for creating/updating bills, PDF export (bills and live menu) with correct Greek rendering, and dynamic categories derived from the products in the database.

— React 19.2.3, Next.js 16.1.6 (App Router), Tailwind v4, Radix UI. DB via Prisma (PostgreSQL).

### Major Features Implemented

#### Billing System
- Bill creation
  - Create a bill via `POST /api/bills` with `tableNumber`, `waiterName`, `baseOrderIds`, `extraOrderIds`, and optional `discount`.
  - The bill snapshot is computed from the current `Order` and `MenuItem` data (unitPrice, lineTotal, subtotalBase/Extras, grandTotal).

- Duplicate prevention (409)
  - Before creation, the system checks for an existing `Bill` that includes any of the submitted order IDs (base/extra). If found, it returns 409 with `billId`/`status`.

- Bill update logic
  - `PATCH /api/bills/:id` allows updating `status`/`discount` and, optionally, refreshing `baseOrderIds`/`extraOrderIds` to include new extras.

- BillItem recalculation
  - When new `baseOrderIds`/`extraOrderIds` are provided in `PATCH`, a full recalculation is performed: delete old `BillItem`, regenerate based on current orders + menu, and update `subtotalBase`/`subtotalExtras`.

- Discount application
  - Supports `percent` or `amount`. The computed discount is always capped to at most the `subtotal`. `grandTotal = subtotal - computedDiscount`, never below 0.

- Print endpoint
  - `GET /api/bills/:id/print` generates a server-side PDF (A4) of the bill with a line table (Description, Qty, Price, Total) and totals.

- Greek PDF rendering
  - Embed Noto Sans fonts (Regular/Bold) via `pdf-lib` + `@pdf-lib/fontkit` for Unicode/Greek. The TTF bytes are fetched at runtime and cached in-memory.

- Non-fiscal disclaimer
  - The PDF includes a clear disclaimer that the document is not a legal fiscal receipt/invoice.

- UI removal panel behavior
  - In the Kitchen Bill popup there is a "Remove" panel for temporarily excluding lines from the displayed totals. The removal affects ONLY the UI (display), not the database.

#### Menu System
- Menu PDF
  - `GET /api/menu/print` generates a PDF of the live menu (grouped by category, sorted, Greek-capable, with disclaimer).

- Menu replace endpoint
  - `POST /api/menu/replace` performs a full menu replacement: hard delete all `MenuItem` entries and insert the new ones. Subsections (subcategories) are stored in `extraNotes`.

- Dynamic categories
  - Categories are generated dynamically from `MenuItem` both in Kitchen and Admin.

- Removal of static lists
  - Static lists/labels for categories have been removed. Where references existed, they were replaced with dynamic values.

- ExtraNotes usage for subcategories
  - Subcategories (e.g., for Drinks/Refreshments: Soft drinks, Water, Ouzo, Retsina, Beers, etc.) are stored in `MenuItem.extraNotes` for display/reference.

#### Kitchen System
- Dynamic categories
  - Category filters and groupings are based on the current `MenuItem`.

- Bill button
  - A "Bill" button opens a calculation popup: select table, show base/extras breakdown, handle discount, create/update Bill, print.

- Menu button
  - A "Menu" button opens the live menu PDF in a new tab.

- Order visualization
  - Order cards with status color coding, items grouped by category, granular per-unit status (`OrderItemUnit`).

- Extras handling
  - Extra orders are identified (isExtra/parentId) and included in a separate subtotal on bills.

#### Admin
- Dynamic category filtering
  - Category dropdown is based on unique categories from `MenuItem` (active/inactive), with full combination of filters/sorting.

- Removal of CATEGORY_LABELS
  - All remnants of the static category map have been removed (e.g., badges now display the dynamic string).

#### UI Infrastructure
- ScrollArea fix
  - Fixed Radix primitives: use `Scrollbar`/`Thumb` instead of non-existent entities. Eliminated the "Maximum update depth exceeded" loop.

- Calendar stub
  - Temporary substitute `components/ui/Calendar.tsx` so `react-day-picker` is not required (incompatible with React 19).

- Removal of incompatible dependency
  - Removed `react-day-picker@8.x` due to a peer conflict with React 19. Related screens remained intact.

---

### Architecture Snapshot

#### Backend
- Next.js API (App Router) with route handlers:
  - Bills: `app/api/bills/route.ts` (GET list, POST create), `app/api/bills/[id]/route.ts` (GET one, PATCH update), `app/api/bills/[id]/print/route.ts` (GET PDF)
  - Menu: `app/api/menu/print/route.ts` (GET PDF), `app/api/menu/replace/route.ts` (POST replace)

#### Database (Prisma models)
- Bill
  - Fields: `id`, `tableNumber`, timestamps (`createdAt`, `closedAt`), `status` (open|closed|cancelled), `waiterName?`.
  - References to orders as arrays: `baseOrderIds`, `extraOrderIds` (no foreign keys).
  - Financial snapshots: `subtotalBase`, `subtotalExtras`, `discountType?`, `discountValue?`, `grandTotal`.
  - Relation: `items: BillItem[]`.

- BillItem
  - Bill line associated with `Bill`.
  - Fields: `menuItemId?`, `name`, `category`, `quantity`, `unitPrice?`, `lineTotal`, `orderId?`, `isExtra`.

- Order
  - Fields: `id`, `tableNumber`, `waiterName`, `timestamp`, `status`, `extraNotes?`, `isExtra`, `parentId?`.
  - Relation: `items: OrderItem[]`.

- OrderItem
  - Fields: `id`, `name`, `quantity`, `category`, `itemStatus`, `extraNotes?`, `orderId`.
  - Relation: `units: OrderItemUnit[]`.

- OrderItemUnit
  - Fields: `id`, `orderItemId`, `status`, `unitIndex`.

- MenuItem
  - Fields: `id`, `name`, `category`, `price?`, `extraNotes?`, `active`.

#### Repositories
- Repository layer implemented in `lib/repositories/prisma.ts` that:
  - Isolates DB access for Menu/Orders/Bills.
  - For Bills:
    - `createBill` with duplicate prevention, snapshot/calculations, and bill lines.
    - `updateBill` with optional refresh of participating orders and full recalculation.
    - `getBill`, `listBills`.

---

### API Documentation Snapshot

#### Bills
- POST `/api/bills`
  - Body:
    ```json
    {
      "tableNumber": "string",
      "waiterName": "string|null",
      "baseOrderIds": ["string"],
      "extraOrderIds": ["string"],
      "discount": { "type": "percent"|"amount", "value": number } | null
    }
    ```
  - 201 → `Bill`
  - 409 → `{ error, billId, status }` if a bill already exists with overlapping orders
  - 400/500 on invalid payload/error

- GET `/api/bills?table=<table>&status=<status>`
  - Returns a list of `Bill[]` with optional filtering.

- GET `/api/bills/:id`
  - Returns a `Bill` (404 if not found).

- PATCH `/api/bills/:id`
  - Body (όλα προαιρετικά):
    ```json
    {
      "status": "open"|"closed"|"cancelled"|string,
      "discount": { "type": "percent"|"amount", "value": number },
      "baseOrderIds": ["string"],
      "extraOrderIds": ["string"]
    }
    ```
  - Updates status/discount and, if IDs are provided, fully refreshes items/totals.

- GET `/api/bills/:id/print`
  - Returns `application/pdf` (inline).

#### Menu
- GET `/api/menu/print`
  - Returns `application/pdf` with the live menu (active items only).

- POST `/api/menu/replace`
  - No body (current implementation). Deletes all `MenuItem` entries and inserts the predefined items of the current version.
  - Returns a summary (e.g., how many deleted/added) — see server logs/implementation.

---

### Known Limitations / Open Items
- Build issue: using `useSearchParams()` on the `/` page requires `<Suspense>` or moving to a Client Component for a successful `next build`.
- PDFs load Noto Sans fonts with runtime fetch from GitHub (in-memory cache). For full independence, they can be moved locally (`public/fonts`).
- The "Remove" panel in the bill is UI-only (does not change the Bill snapshot in the DB).

---

### Versions / Tooling
- React 19.2.3, Next 16.1.6, Prisma 6.4.1
- `pdf-lib@^1.17.1`, `@pdf-lib/fontkit@^1.1.1`
- Tailwind CSS v4, Radix UI
