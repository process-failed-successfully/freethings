## 2024-06-22 - Improved Checkbox Accessibility

**Learning:** Using `display: none` on native checkbox inputs in custom implementations completely removes them from the tab order, breaking keyboard accessibility. A visually hidden technique (e.g., `position: absolute; opacity: 0; width: 0; height: 0;`) keeps them accessible while allowing custom styling of the wrapper label.

**Action:** Always use visually hidden techniques for native inputs instead of `display: none`. Use `:focus-within` on the parent container to provide clear focus indicators for keyboard users.
