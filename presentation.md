# Taverna Prodromes — Digital Ordering System

Pilot Presentation

Owner: Prodromos Sarakinou  
Challenge: 100 Days of Code  
System: NextJS + Flutter Waiter App

---

## 1 — Problem

Traditional tavern service has:

- Paper orders
- Communication errors
- Lost extras
- Slow kitchen coordination
- No real-time visibility

Goal:  
Create a lightweight digital ordering system usable during real service.

---

## 2 — Architecture

Frontend  
Flutter Waiter App (PDA)

Backend  
NextJS API

Database  
PostgreSQL

Deployment  
Heroku

Capabilities

- Real-time orders
- Kitchen display
- Extras management
- Billing system
- Menu management

---

## 3 — Waiter App (PDA)

Screens (3 per row with captions):

<div style="display:flex; flex-wrap:wrap; gap:12px; justify-content:space-between;">
  <figure style="flex:0 0 32%; margin:0; text-align:center;">
    <img src="screens/homeInterfacePDA-σερβιτόρου.png" alt="Home — PDA" style="width:100%; height:auto;" />
    <figcaption style="font-size:12px; margin-top:6px;">Home — PDA</figcaption>
  </figure>
  <figure style="flex:0 0 32%; margin:0; text-align:center;">
    <img src="screens/λήψΠαραγγελίαςPDA-σερβιτόρου.png" alt="Λήψη παραγγελίας — PDA" style="width:100%; height:auto;" />
    <figcaption style="font-size:12px; margin-top:6px;">Λήψη παραγγελίας — PDA</figcaption>
  </figure>
  <figure style="flex:0 0 32%; margin:0; text-align:center;">
    <img src="screens/επιλογήΠαραγγελίαςΓιαΠροσθήκηΈξτραPDA-σερβιτόρου.png" alt="Επιλογή παραγγελίας για έξτρα — PDA" style="width:100%; height:auto;" />
    <figcaption style="font-size:12px; margin-top:6px;">Επιλογή παραγγελίας για έξτρα — PDA</figcaption>
  </figure>
  <figure style="flex:0 0 32%; margin:0; text-align:center;">
    <img src="screens/λήψηΠαραγγελίας-ΈξτραPDA-σερβιτόρου.png" alt="Έξτρα — PDA" style="width:100%; height:auto;" />
    <figcaption style="font-size:12px; margin-top:6px;">Ροή έξτρα — PDA</figcaption>
  </figure>
  <figure style="flex:0 0 32%; margin:0; text-align:center;">
    <img src="screens/Παραγγελίες-PDA-σερβιτόρου.png" alt="Παραγγελίες — PDA" style="width:100%; height:auto;" />
    <figcaption style="font-size:12px; margin-top:6px;">Λίστα παραγγελιών — PDA</figcaption>
  </figure>
  <figure style="flex:0 0 32%; margin:0; text-align:center;">
    <img src="screens/λήψηΠαραγγελίας-liveOrderingPDA-σερβιτόρου.png" alt="Live ordering — PDA" style="width:100%; height:auto;" />
    <figcaption style="font-size:12px; margin-top:6px;">Live ordering — PDA</figcaption>
  </figure>
</div>

Functions

- Start order
- Add extras
- View orders
- Select correct base order
- Fast interaction optimized for touch

---

## 4 — Order Intake

Features

- Category filtering
- Fast product grid
- Item notes
- Live order building
- Order confirmation

---

## 5 — Extras Flow

Key design decision:  
Extras are separate kitchen tickets but linked to the base order.

Benefits

- Kitchen clarity
- No confusion during busy service
- Accurate billing

---

## 6 — Kitchen Display

Capabilities

- Live orders
- Sorting by time
- Order editing
- Soft delete
- Status tracking

Used during the pilot under heavy load.

Screens (3 per row):

<div style="display:flex; flex-wrap:wrap; gap:12px; justify-content:space-between;">
  <figure style="flex:0 0 32%; margin:0; text-align:center;">
    <img src="screens/Κουζίνα-Παραγγελίες.png" alt="Κουζίνα — Παραγγελίες" style="width:100%; height:auto;" />
    <figcaption style="font-size:12px; margin-top:6px;">Κουζίνα — Παραγγελίες</figcaption>
  </figure>
  <figure style="flex:0 0 32%; margin:0; text-align:center;">
    <img src="screens/Λογαριασμός.png" alt="Λογαριασμός" style="width:100%; height:auto;" />
    <figcaption style="font-size:12px; margin-top:6px;">Λογαριασμός</figcaption>
  </figure>
  <figure style="flex:0 0 32%; margin:0; text-align:center;">
    <img src="screens/Αdmin-Προϊόντα.png" alt="Admin — Προϊόντα" style="width:100%; height:auto;" />
    <figcaption style="font-size:12px; margin-top:6px;">Admin — Προϊόντα</figcaption>
  </figure>
</div>

---

## 7 — Billing System

Features

- Bill aggregation
- Extras included automatically
- Print-ready PDF
- Order auto-close after billing

---

## 8 — Admin Panel

Allows

- Menu editing
- Activation / deactivation
- Category management
- Notes

---

## 9 — Real World Pilot

Event  
Clean Monday  
Traditional Koudounoforoi Festival

Environment  
High volume service  
Real restaurant operation  
No staging testing beforehand

Outcome  
System remained stable throughout the service.

---

## 10 — Pilot Statistics

Menu

- 56 total items
- 37 active

Orders

- 142 total processed

Bills

- 89 created

Top item (private)

- Βίκος Κόλα 250ml

Total items processed

- 940

---

## 11 — Operational Observations

What worked well

- Fast order entry
- Clear extras workflow
- Kitchen visibility
- PDA usability
- Corrections handled via soft delete without blocking service.

---

## 12 — Key Fixes During Pilot

- Removed 10 order cap in kitchen
- Prevented cross-table bill merges
- Added completed orders to billing popup
- Soft delete instead of hard delete
- Kitchen editing popup
- Bill search and filters

---

## 13 — System Maturity

From idea → live service in days.  
Real restaurant test  
Hundreds of items processed  
Multiple staff users  
Stable PDA operation

---

## 14 — Next Steps

- UI polish
- Deployment improvements
- Analytics dashboard
- Performance optimizations
- Continued pilot testing
