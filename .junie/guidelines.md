# Project Guidelines

## Tech Stack & Core Technologies
- **Framework:** Next.js (App Router)
- **React:** Version 19+ (using `use client` where necessary)
- **Styling:** Tailwind CSS v4 (configured via `app/globals.css`)
- **Animations:** `tw-animate-css`
- **Icons:** `lucide-react`
- **UI Components:** Radix-based primitives (e.g., `cmdk` for Command)

## Coding Standards
- **Components:** Use functional components with TypeScript.
- **Naming:** 
  - Components: PascalCase (e.g., `CommandInput.tsx`)
  - Utilities/Hooks: camelCase (e.g., `useAuth.ts`)
- **Props:** Use `React.ComponentProps` or specific interfaces for prop typing.
- **File Structure:** 
  - Shared UI components go in `components/ui/`.
  - Feature-specific components should be grouped near their routes or in a `components/features/` folder.

## Styling Guidelines
- **Utility-First:** Prefer Tailwind utility classes over custom CSS.
- **Conditionals:** Use the `cn()` utility (defined in `components/ui/utils.ts`) for merging classes.
- **Theming:** Use CSS variables defined in `app/globals.css` for colors (`--primary`, `--background`, etc.).
- **Responsive Design:** Use standard Tailwind breakpoints (`sm:`, `md:`, `lg:`, etc.).

## Project Specifics
- **Animations:** When using animations, refer to `tw-animate-css` documentation or existing patterns in `globals.css`.
- **Command Palette:** The `Command.tsx` component is the central hub for global actions.
