## 2024-05-23 - Accessible Custom Controls
**Learning:** Hiding native form controls with `display: none` to show custom UI prevents keyboard focus and screen reader access.
**Action:** Use a "visually hidden" pattern (absolute position, zero opacity) for native inputs and use `:focus-within` on the container to provide visual feedback. Additionally, custom interactive elements like `div` cards must have `role="button"`, `tabindex="0"`, and handle `Enter`/`Space` keys.
