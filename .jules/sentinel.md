# Sentinel Journal 🛡️

## 2026-06-20 - DOM-based XSS in Text Tools
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) in `text-case-converter` and `base64-converter`. User-provided text was directly injected into the DOM using `innerHTML` without sanitization.
**Learning:** Many tools in this repository follow a pattern of using `innerHTML` for convenience when displaying results, often mixing structural HTML (like icons) with user data in the same string template. This makes it easy to accidentally introduce XSS.
**Prevention:** Always use `textContent` for user-provided data. If structural HTML is needed, create the structure first (via `innerHTML` or `createElement`), then find the specific text node or element that should hold the user data and set its `textContent`.

## 2026-06-21 - Systemic DOM-XSS Refactoring
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) in `unit-converter`, `qrcode-site`, and `base64-converter`.
**Learning:** The "structural HTML + textContent" pattern is robust but requires careful selection of child elements (e.g., `.result-value`, `.file-name`). It's a common pattern in this monorepo to use template literals for complex result cards, which often leads to accidental XSS.
**Prevention:** Standardize on a "render structure, then populate data" approach for all tool result displays.

## 2024-05-24 - Defensive Refactoring against DOM-XSS
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) via maliciously crafted filenames in  and , and via generated output in .
**Learning:** Even internal tool data (like filenames or generated passwords) should be treated as untrusted. Mixing  with user-controlled variables in template literals is a systemic risk in this repository. In , extension parsing () was also a secondary XSS vector.
**Prevention:** Use the "Structural HTML + textContent" pattern for all dynamic UI updates. Replace  attributes in generated HTML strings with programmatic  or  to avoid attribute injection.

## 2024-05-24 - Defensive Refactoring against DOM-XSS
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) via maliciously crafted filenames in `image-resizer` and `image-converter`, and via generated output in `password-generator`.
**Learning:** Even internal tool data (like filenames or generated passwords) should be treated as untrusted. Mixing `innerHTML` with user-controlled variables in template literals is a systemic risk in this repository. In `image-converter`, extension parsing (`fileFormat`) was also a secondary XSS vector.
**Prevention:** Use the "Structural HTML + textContent" pattern for all dynamic UI updates. Replace `onclick` attributes in generated HTML strings with programmatic `.onclick` or `addEventListener` to avoid attribute injection.

## 2025-05-15 - Persistent XSS and Stability in Reading Helper
**Vulnerability:** DOM-based XSS via user-controlled story titles and page text in `reading-helper`, persistable via `localStorage`. Trailing syntax errors in `data.js` also caused runtime crashes.
**Learning:** Tools that persist data (like `localStorage` for custom stories) create a "stored" XSS vector if not rendered safely. Additionally, monolithic rendering loops are fragile; a single malformed entry (e.g., from a syntax error in shared data) can crash the entire UI.
**Prevention:** Always use `textContent` for persisted user data. Implement defensive null-checks in all rendering loops and data loading functions to prevent "Cannot read properties of undefined" crashes.

## 2026-06-29 - DOM-based XSS in Worksheet Generator
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) in `worksheet-generator`. The `showError` function was using `innerHTML` to display messages, which could be exploited if user-controlled data was passed to it.
**Learning:** Even utility functions like `showError` that are intended for system messages can become XSS vectors if they are not consistently refactored to use `textContent`.
**Prevention:** Follow the "Structural HTML + textContent" pattern for all UI messages, including errors.

## 2024-05-24 - CSP Readiness via Inline Handler Removal
**Vulnerability:** Systemic reliance on inline event handlers (`onclick`, `onchange`) prevents the enforcement of a strict Content Security Policy (CSP), leaving the application vulnerable to XSS if a single injection point is found.
**Learning:** Refactoring to programmatic listeners requires careful handling of shared global functions (like `manageCookieConsent`) and using `e.currentTarget` in event listeners to ensure state changes (like active classes) are applied to the correct element regardless of where the click landed within the button.
**Prevention:** Eliminate all inline JS from HTML. Target elements by ID or data attributes and use event delegation for dynamic or repeated components.
