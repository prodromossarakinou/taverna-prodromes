# _progress Foldering Structure — Specification

Owner: Michael — Project Management & Progress Documentation

The `_progress` directory is the official commit-level progress ledger across all branches. It provides structured, auditable, human-readable execution tracking aligned with actual commits. It is independent from source code and separate from product README documentation.

This specification is mandatory for all tracked commits included in MVP delivery.

---

## Purpose

The `_progress` folder exists to:

- Maintain auditable progress per commit
- Capture behavioral and contract-level changes, not only code diffs
- Provide operational visibility without requiring code inspection
- Support MVP tracking and release readiness validation
- Create a consistent reporting layer across repositories

This folder is documentation-only. Source code is not permitted inside `_progress`.

---

## Top-Level Structure

The directory follows a temporal hierarchy:

- `_progress/`
  - `YYYY-MM/` (e.g., `2026-02/`)
    - `README.md` (Monthly Executive Report for Michael - Summary, Status, Highlights)
    - `logs.md` (Technical Chronological Logs - Detailed commit-level tracking)
    - `[feature-name].md` (Optional feature-specific progress)

The `README.md` in each monthly folder serves as the "Friendly Report" for the Project Manager, while `logs.md` maintains the technical audit trail.

Each entry within these files must follow the timestamp standard: `YYYY-MM-DD HH:MM`.

