# Architecture & Structure Guidelines

Based on industry standards and Next.js best practices (inspired by leading contributors like Tim Neutkens).

## Folder Structure
- `app/`: Contains routes, layouts, and page-specific components.
- `components/`: 
  - `ui/`: Shared, low-level UI primitives (Radix, Tailwind-based).
  - `features/`: Feature-scoped components (e.g., `kitchen/`, `waiter/`).
  - `shared/`: Generic reusable components not tied to specific features.
- `hooks/`: Custom React hooks.
- `lib/`: Utility functions, constants, and shared configurations.
- `types/`: Global TypeScript definitions.
- `contexts/`: React Context providers for state management.

## Component Organization
- Prefer Colocation: Keep components as close as possible to where they are used.
- Feature-based grouping: Group logic and components by business domain.
