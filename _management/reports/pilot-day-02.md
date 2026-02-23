# Pilot Report — Day 2 (Live Restaurant Test)

Date: 2026-02-23  
Event: Clean Monday / Koudounoforoi Parade  
Environment: Real restaurant service conditions

## Summary
Second live pilot completed during a high-traffic traditional event.
The ordering system operated continuously during service without failures.

The application was used directly in real working conditions with staff using PDA devices.

## System Statistics

### Menu
Active items: 37  
Total items: 56

#### Menu Analytics (aggregate, public-safe)
- Distinct items ordered during service: 53
- Observed mix favored beverages and grill items, matching event-day demand patterns.
- Several long-tail items saw minimal selections; menu review planned post-pilot.

### Orders
Total orders: 142

Breakdown:
- Closed: 83
- Delivered: 6
- Deleted (corrections during service): 53

### Bills
Total bills issued: 89

Breakdown:
- Open bills: 0
- Closed bills: 89

## Observations
- System remained stable during heavy service load.
- Order correction workflow (soft delete) proved useful during peak time.
- Kitchen workflow remained uninterrupted.
- PDA devices operated without issues.
 - Aggregate menu analytics recorded and reviewed internally; no item names or per-item counts are published.

## Status
Pilot testing continues as part of the 100 Days Challenge.
