# 100 Days Challenge — Local Order System (Next.js Only)

**Disclaimer:** This is a non-commercial, educational project created for learning purposes and internal use. The architecture and code patterns are inspired by community best practices and open-source contributions (including those by Tim Neutkens). It is not intended for profit or commercial distribution.

Owner: Michael — Project Management  
UI/UX Lead: Alexander

This project runs under a **100 Days Challenge** delivery model.  
The system is implemented entirely with Next.js (web-only stack), covering server, admin/pass view, and order-taking interface.

No Flutter or separate mobile codebase is used. Mobile devices access the system through the browser over the local network.

---

## Challenge Model

Duration: 100 consecutive days  
Rule: Every day must produce measurable, logged progress.

Valid daily progress includes:

- Feature implementation
- Bug fixes
- Behavioral refactors
- UI/UX improvements
- Build and dependency fixes
- Printing integration work
- Performance and reliability improvements
- Documentation and runbook updates
- Structured progress logs

Progress must be commit-backed and documented.

---

## System Objective

Build a local-network order management system using **Next.js only**, providing:

- Order taking UI (mobile browser friendly)
- Pass / kitchen management UI
- Local API endpoints
- Real-time order visibility
- Server-side ticket printing
- LAN-only operation
- No authentication in initial scope

---

## Architecture

Single repository:

- Next.js application
  - App Router / API routes
  - Order-taking UI (PDA/mobile browser)
  - Pass / kitchen dashboard
  - Local persistence layer
  - Printing integration
  - Real-time update mechanism (SSE or equivalent)

Mobile devices act as thin clients via browser on the same LAN.

---

## Operating Constraints

- Server runs on a local PC
- Access limited to local network
- No authentication (current scope)
- No cloud dependency required
- System must operate offline inside LAN
- Printer connected locally or via LAN
- Mobile access via browser only

---

## Progress Tracking Standard

All meaningful commits must be documented.

Structure:

