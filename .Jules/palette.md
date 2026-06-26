# Palette's Journal - Critical UX & Accessibility Learnings

## 2024-05-15 - Improving Keyboard Accessibility for Custom Components
**Learning:** Custom interactive elements like "cards" or "presets" that use `onclick` handlers are often inaccessible to keyboard users unless they are explicitly given a `role="button"`, a `tabindex="0"`, and explicit keyboard listeners for 'Enter' and 'Space'. Simply adding a hover state is not enough for a great UX.
**Action:** Always ensure custom clickable elements have proper ARIA roles, tabindex, and keyboard event parity with their click behavior.

## 2024-05-20 - Communicating Visibility State for Toggles
**Learning:** For interactive elements that toggle visibility of other content (like FAQ accordions), simply being keyboard-triggerable is insufficient. Screen reader users need the `aria-expanded` attribute on the trigger element to know if the associated content is currently visible or hidden.
**Action:** Always implement and dynamically update `aria-expanded="true/false"` when creating toggleable UI components.

## 2026-06-24 - Micro-UX and Meaningful Interaction Feedback
**Learning:** For utility tools with "Copy" actions, providing immediate visual feedback (e.g., changing button text to "Copied!") and managing the button's enabled/disabled state based on input presence significantly reduces user confusion and prevents empty clipboard operations.
**Action:** Always provide clear visual confirmation for clipboard actions and disable action buttons that would result in a no-op due to missing input.

## 2026-06-26 - Preventing Layout Shifts on Custom Focus Indicators
**Learning:** Adding a border for `:focus-visible` styles on custom interactive elements (like cards) can cause jarring layout shifts if not compensated for. Using `calc()` to reduce padding by the border width maintains the element's dimensions.
**Action:** When adding focus borders to custom elements, always adjust padding using `calc(original_padding - border_width)` to ensure a smooth, shift-free transition.
