# kitchen-stable-sorting — Logs

Status: COMPLETED  
Created: 2026-02-23 04:01

## Investigation
- Reproduction:
  1. Open Kitchen view and expand an order with multiple items across categories.
  2. Change item/unit statuses (e.g., pending → ready → delivered).
  3. Observe items reordering within the list and occasional unit reordering inside an item.
- Hypotheses:
  - Sorting depends on transient fields (status), causing reshuffles on updates.
  - Arrays are rendered in original insertion order without a stable sort.
  - Locale issues (Greek vs English) lead to unexpected category/name ordering.

## Findings
- Items within an order were not sorted stably; grouping by category existed but rendering relied on object/array order or status-driven transforms.
- Units inside an item (when quantity > 1) were rendered using the current units array order, which could shift when unit status changed.
- No locale-aware comparator was used for categories/product names, leading to inconsistent A–Z / Α–Ω expectations.

## Fix
- Implemented locale-aware, status-independent sorting for categories, items, and units.

### Files
- `components/features/kitchen/OrderCard.tsx`
  - Added memoized `Intl.Collator(['el','en'], { sensitivity: 'base', numeric: true })`.
  - Sorted category keys alphabetically (Greek + English) and then sorted items by `name` within each category using the same collator.
  - Sorting is applied on `.slice()` copies to avoid mutating original arrays.

- `components/features/kitchen/OrderItemRow.tsx`
  - Built a normalized `units` list (fallback to `quantity` if `units` missing).
  - Introduced `sortedUnits` with stable ordering:
    - Primary: numeric `unitIndex` ascending
    - Fallback: `id` using `localeCompare` with `{ numeric: true, sensitivity: 'base' }`
  - Rendering and status calculations now operate on `sortedUnits`, eliminating reordering on status changes.

### Key snippets
```ts
// OrderCard.tsx — collator and item sorting
const collator = useMemo(() => new Intl.Collator(['el', 'en'], { sensitivity: 'base', numeric: true }), []);
const sortedCategoryKeys = useMemo(() => Object.keys(groupedItems).sort((a, b) => collator.compare(String(a), String(b))), [groupedItems, collator]);
const items = (groupedItems[category] ?? []).slice().sort((a, b) => collator.compare(a.name ?? '', b.name ?? ''));
```

```ts
// OrderItemRow.tsx — stable unit ordering
const sortedUnits = units.slice().sort((a, b) => {
  const ai = typeof a.unitIndex === 'number' ? a.unitIndex : Number.POSITIVE_INFINITY;
  const bi = typeof b.unitIndex === 'number' ? b.unitIndex : Number.POSITIVE_INFINITY;
  if (ai !== bi) return ai - bi;
  return String(a.id).localeCompare(String(b.id), undefined, { numeric: true, sensitivity: 'base' });
});
```

## Verification
1) Open Kitchen and pick an order with multiple categories and multi-quantity items.
2) Toggle item and per-unit statuses repeatedly.
3) Expected:
   - Categories remain in alphabetical order (A–Z / Α–Ω).
   - Items remain sorted alphabetically within each category regardless of status.
   - Units maintain numeric order (×1, ×2, ×3, …) independent of status.
4) Scroll and interaction behavior: no jitter or unexpected scroll jumps.

## Regressions Check
- No changes to data model or API.
- Kitchen editing flow (Edit → Save/Cancel) works as before.
- Bill popup, calculations, and printing unaffected.

## Commit
- Message: `chore(kitchen): stable sorting for items and units (locale-aware, status-independent)`
- Scope: UI-only changes in Kitchen components.

## Impact
- Eliminates visual reshuffling during operations, preserving mental mapping for staff.
- Aligns with requirement: "By category alphabetically, then by product alphabetically (Greek + English)" and stable units ordering.

## Next Suggestions (optional)
- If performance concerns arise with very large lists, consider list virtualization in Kitchen to keep rendering snappy while preserving the same stable sorting rules.
