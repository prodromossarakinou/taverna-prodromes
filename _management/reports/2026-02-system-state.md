### System Overview

Το σύστημα είναι μια εφαρμογή Next.js (App Router) για διαχείριση παραγγελιών ταβέρνας με τρεις βασικές όψεις: Waiter (παραγγελιοληψία), Kitchen (εκτέλεση/παρακολούθηση και υπολογισμός λογαριασμού) και Admin (διαχείριση μενού). Περιλαμβάνει πλήρη ροή δημιουργίας/ενημέρωσης λογαριασμών, εξαγωγή PDF (λογαριασμών και live μενού) με σωστή απόδοση ελληνικών, και δυναμικές κατηγορίες που προκύπτουν από τα προϊόντα της βάσης.

— React 19.2.3, Next.js 16.1.6 (App Router), Tailwind v4, Radix UI. DB μέσω Prisma (PostgreSQL).

### Major Features Implemented

#### Billing System
- Bill creation
  - Δημιουργία λογαριασμού μέσω `POST /api/bills` με `tableNumber`, `waiterName`, `baseOrderIds`, `extraOrderIds` και προαιρετική `discount`.
  - Το snapshot του λογαριασμού υπολογίζεται από τα τρέχοντα `Order` και `MenuItem` (unitPrice, lineTotal, subtotalBase/Extras, grandTotal).

- Duplicate prevention (409)
  - Πριν τη δημιουργία, γίνεται έλεγχος για υπάρχον `Bill` που περιλαμβάνει οποιοδήποτε από τα υποβληθέντα order IDs (base/extra). Αν βρεθεί, επιστρέφεται 409 με `billId`/`status`.

- Bill update logic
  - Το `PATCH /api/bills/:id` επιτρέπει ενημέρωση `status`/`discount` και, προαιρετικά, ανανέωση των `baseOrderIds`/`extraOrderIds` ώστε να συμπεριληφθούν νέα extras.

- BillItem recalculation
  - Όταν στα `PATCH` δοθούν νέες `baseOrderIds`/`extraOrderIds`, γίνεται πλήρης ανα-υπολογισμός: διαγραφή παλιών `BillItem`, εκ νέου παραγωγή με βάση τα τρέχοντα orders + menu και ενημέρωση `subtotalBase`/`subtotalExtras`.

- Discount application
  - Υποστηρίζονται `percent` ή `amount`. Ο υπολογισμός κόβει πάντα στο πολύ το `subtotal`. `grandTotal = subtotal - computedDiscount`, ποτέ κάτω από 0.

- Print endpoint
  - `GET /api/bills/:id/print` δημιουργεί server-side PDF (Α4) του λογαριασμού με πίνακα γραμμών (Περιγραφή, Ποσ., Τιμή, Σύνολο) και σύνολα.

- Greek PDF rendering
  - Ενσωμάτωση γραμματοσειρών Noto Sans (Regular/Bold) μέσω `pdf-lib` + `@pdf-lib/fontkit` για Unicode/ελληνικά. Τα bytes των TTF γίνεται fetch runtime και cache in-memory.

- Non-fiscal disclaimer
  - Στο PDF προσαρτάται σαφής αποποίηση ότι το έγγραφο δεν αποτελεί νόμιμο φορολογικό παραστατικό/απόδειξη.

- UI removal panel behavior
  - Στο Kitchen Bill popup υπάρχει panel «Αφαίρεση» για προσωρινή εξαίρεση γραμμών από τα εμφανιζόμενα σύνολα. Η αφαίρεση επηρεάζει ΜΟΝΟ την απεικόνιση (UI-only), όχι τη βάση.

#### Menu System
- Menu PDF
  - `GET /api/menu/print` για παραγωγή PDF του ζωντανού μενού (ομαδοποίηση ανά κατηγορία, ταξινόμηση, ελληνικά, αποποίηση).

- Menu replace endpoint
  - `POST /api/menu/replace` για ολική αντικατάσταση μενού: hard delete όλων των `MenuItem` και εισαγωγή των νέων. Τα υπο-τμήματα (υποκατηγορίες) αποθηκεύονται στο `extraNotes`.

- Dynamic categories
  - Οι κατηγορίες παράγονται δυναμικά από τα `MenuItem` τόσο στο Kitchen όσο και στο Admin.

- Removal of static lists
  - Έχουν αφαιρεθεί οι στατικές λίστες/labels για κατηγορίες. Όπου υπήρχαν αναφορές, αντικαταστάθηκαν με δυναμικές τιμές.

- ExtraNotes usage for subcategories
  - Οι υποκατηγορίες (π.χ. για Ποτά/Αναψυκτικά: Αναψυκτικά, Νερό, Ούζο, Ρετσίνα, Μπύρες, κ.λπ.) αποθηκεύονται στο `MenuItem.extraNotes` για εμφάνιση/αναφορά.

#### Kitchen System
- Dynamic categories
  - Φίλτρα κατηγοριών και ομαδοποιήσεις βασίζονται στα τρέχοντα `MenuItem`.

- Bill button
  - Κουμπί «Λογαριασμός» ανοίγει popup υπολογισμού: επιλογή τραπεζιού, εμφάνιση ανάλυσης βάσης/extras, χειρισμός έκπτωσης, δημιουργία/ενημέρωση Bill, εκτύπωση.

- Menu button
  - Κουμπί «Μενού» ανοίγει το live menu PDF σε νέο tab.

- Order visualization
  - Κάρτες παραγγελιών με χρωματική σήμανση κατάστασης, ομαδοποίηση items ανά κατηγορία, granular status ανά μονάδα (`OrderItemUnit`).

- Extras handling
  - Τα extra orders αναγνωρίζονται (isExtra/parentId) και συμπεριλαμβάνονται σε ξεχωριστό subtotal στα bills.

#### Admin
- Dynamic category filtering
  - Dropdown κατηγορίας βασισμένο στις μοναδικές κατηγορίες από τα `MenuItem` (ενεργά/ανενεργά), με πλήρη συνδυασμό φίλτρων/ταξινόμησης.

- Removal of CATEGORY_LABELS
  - Έχει αφαιρεθεί κάθε υπόλειμμα στατικού map κατηγοριών (π.χ. badge εμφάνιζε πλέον το δυναμικό string).

#### UI Infrastructure
- ScrollArea fix
  - Διορθώθηκαν τα Radix primitives: χρήση `Scrollbar`/`Thumb` αντί μη υπαρχουσών οντοτήτων. Εξάλειψη loop «Maximum update depth exceeded».

- Calendar stub
  - Προσωρινό υποκατάστατο `components/ui/Calendar.tsx` ώστε να μην απαιτείται `react-day-picker` (ασύμβατο με React 19).

- Removal of incompatible dependency
  - Αφαιρέθηκε το `react-day-picker@8.x` λόγω peer conflict με React 19. Διατηρήθηκαν αλώβητες οι σχετικές οθόνες.

---

### Architecture Snapshot

#### Backend
- Next.js API (App Router) με route handlers:
  - Bills: `app/api/bills/route.ts` (GET list, POST create), `app/api/bills/[id]/route.ts` (GET one, PATCH update), `app/api/bills/[id]/print/route.ts` (GET PDF)
  - Menu: `app/api/menu/print/route.ts` (GET PDF), `app/api/menu/replace/route.ts` (POST replace)

#### Database (Prisma models)
- Bill
  - Πεδία: `id`, `tableNumber`, χρονικά (`createdAt`, `closedAt`), `status` (open|closed|cancelled), `waiterName?`.
  - Αναφορές σε orders ως arrays: `baseOrderIds`, `extraOrderIds` (χωρίς foreign keys).
  - Οικονομικά snapshots: `subtotalBase`, `subtotalExtras`, `discountType?`, `discountValue?`, `grandTotal`.
  - Σχέση: `items: BillItem[]`.

- BillItem
  - Γραμμή λογαριασμού συσχετισμένη με `Bill`.
  - Πεδία: `menuItemId?`, `name`, `category`, `quantity`, `unitPrice?`, `lineTotal`, `orderId?`, `isExtra`.

- Order
  - Πεδία: `id`, `tableNumber`, `waiterName`, `timestamp`, `status`, `extraNotes?`, `isExtra`, `parentId?`.
  - Σχέση: `items: OrderItem[]`.

- OrderItem
  - Πεδία: `id`, `name`, `quantity`, `category`, `itemStatus`, `extraNotes?`, `orderId`.
  - Σχέση: `units: OrderItemUnit[]`.

- OrderItemUnit
  - Πεδία: `id`, `orderItemId`, `status`, `unitIndex`.

- MenuItem
  - Πεδία: `id`, `name`, `category`, `price?`, `extraNotes?`, `active`.

#### Repositories
- Υλοποίηση repository layer στο `lib/repositories/prisma.ts` που:
  - Απομονώνει πρόσβαση στη DB για Menu/Orders/Bills.
  - Για Bills: 
    - `createBill` με duplicate prevention, snapshot/υπολογισμούς και γραμμές bill.
    - `updateBill` με προαιρετική ανανέωση συμμετοχών orders και πλήρη επανυπολογισμό.
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
  - 409 → `{ error, billId, status }` αν υπάρχει ήδη bill με overlap orders
  - 400/500 σε άκυρο payload/σφάλμα

- GET `/api/bills?table=<table>&status=<status>`
  - Επιστρέφει λίστα `Bill[]` με προαιρετικό φιλτράρισμα.

- GET `/api/bills/:id`
  - Επιστρέφει `Bill` (404 αν δεν βρεθεί).

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
  - Ενημερώνει status/έκπτωση και, αν δοθούν ids, ανανεώνει πλήρως τα items/σύνολα.

- GET `/api/bills/:id/print`
  - Επιστρέφει `application/pdf` (inline).

#### Menu
- GET `/api/menu/print`
  - Επιστρέφει `application/pdf` με το ζωντανό μενού (μόνο ενεργά items).

- POST `/api/menu/replace`
  - Χωρίς body (τρέχουσα υλοποίηση). Διαγράφει όλα τα `MenuItem` και εισάγει τα προκαθορισμένα της τρέχουσας έκδοσης.
  - Επιστρέφει περίληψη (π.χ. πόσα διέγραψε/πρόσθεσε) — βλ. server logs/υλοποίηση.

---

### Known Limitations / Open Items
- Build issue: χρήση `useSearchParams()` στη σελίδα `/` απαιτεί `<Suspense>` ή μεταφορά σε Client Component για επιτυχή `next build`.
- Τα PDF φορτώνουν γραμματοσειρές Noto Sans με runtime fetch από GitHub (cache in-memory). Για πλήρη ανεξαρτησία, μπορούν να μεταφερθούν local (`public/fonts`).
- Το panel «Αφαίρεση» στον λογαριασμό είναι UI-only (δεν αλλάζει το snapshot του Bill στη DB).

---

### Versions / Tooling
- React 19.2.3, Next 16.1.6, Prisma 6.4.1
- `pdf-lib@^1.17.1`, `@pdf-lib/fontkit@^1.1.1`
- Tailwind CSS v4, Radix UI
