# Palette's Journal - Critical UX & Accessibility Learnings

## 2024-05-15 - Improving Keyboard Accessibility for Custom Components
**Learning:** Custom interactive elements like "cards" or "presets" that use `onclick` handlers are often inaccessible to keyboard users unless they are explicitly given a `role="button"`, a `tabindex="0"`, and explicit keyboard listeners for 'Enter' and 'Space'. Simply adding a hover state is not enough for a great UX.
**Action:** Always ensure custom clickable elements have proper ARIA roles, tabindex, and keyboard event parity with their click behavior.

## 2024-05-20 - Communicating Visibility State for Toggles
**Learning:** For interactive elements that toggle visibility of other content (like FAQ accordions), simply being keyboard-triggerable is insufficient. Screen reader users need the `aria-expanded` attribute on the trigger element to know if the associated content is currently visible or hidden.
**Action:** Always implement and dynamically update `aria-expanded="true/false"` when creating toggleable UI components.
