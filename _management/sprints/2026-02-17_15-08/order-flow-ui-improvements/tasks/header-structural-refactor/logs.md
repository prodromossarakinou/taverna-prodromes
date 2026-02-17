# Task Logs — header-structural-refactor

## 2026-02-17 16:35
- Removed floating mode selector wrapper from `app/page.tsx`.
- Integrated `ThemeToggle` and mode switching controls directly into `WaiterHeader.tsx` and `KitchenHeader.tsx`.
- Refactored header layout to a standard flex row: title on left, interactive actions on right.
- Eliminated all `fixed`, `absolute`, `sticky`, and `z-index` classes from the header and selector components.
- Adjusted `WaiterView.tsx` and `KitchenDisplay.tsx` to receive view-switching and mode-switching callbacks and pass them to headers.
- Verified that headers now scroll with the content and never overlay the UI.
- Removed residual `relative` and `z-10` classes from `OrderSummary.tsx` mode badges to ensure a clean, standard document flow.
