# Task Logs — confirmation-popups-restoration

## 2026-02-17 16:38
- Added `submitConfirmOpen` and `clearConfirmOpen` state flags to `WaiterView.tsx`.
- Updated `OrderSummary` callback props to open confirmation popups instead of executing actions directly.
- Implemented `Popup` components for Submit/Save and Clear/Cancel confirmation in `WaiterView.tsx`.
- Configured prompt messages to adapt based on the current mode (`new` vs `extras`).
- Ensured that actual submission and clearing logic only executes upon confirmation within the popup.
- Cleaned up `window.confirm()` usage in favor of the custom `Popup` UI component for a more consistent and professional look.
