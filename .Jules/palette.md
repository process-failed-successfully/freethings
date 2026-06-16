## 2025-05-14 - [Focus-Visible for Animated Cards]
**Learning:** Interactive elements with hover animations (like tool cards) must also trigger those animations on `:focus-visible` to ensure parity between mouse and keyboard experiences. Using `box-shadow` instead of `outline` for card focus states allows for a more integrated "glow" effect that respects the component's border radius and depth.
**Action:** Always pair `:hover` transformations with `:focus-visible` equivalents for complex interactive components, and prefer `box-shadow: 0 0 0 3px color` for high-radius card focus indicators.
