# Limitations & Exceptions

## Prohibited Patterns
- No inline styles (use Tailwind classes).
- No direct DOM manipulation (use React refs only when necessary).
- No heavy logic inside components (move to hooks or lib).

## Exceptions
- Legacy Vite components: When migrating, prioritize functionality but mark for refactoring to meet Next.js standards.
- Third-party libraries: If a library requires a specific pattern (e.g., specific folder naming), document it here.

## Performance
- Avoid unnecessary `use client` high in the tree.
- Optimize images using `next/image`.
