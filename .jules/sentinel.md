# Sentinel Journal 🛡️

## 2026-06-20 - DOM-based XSS in Text Tools
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) in `text-case-converter` and `base64-converter`. User-provided text was directly injected into the DOM using `innerHTML` without sanitization.
**Learning:** Many tools in this repository follow a pattern of using `innerHTML` for convenience when displaying results, often mixing structural HTML (like icons) with user data in the same string template. This makes it easy to accidentally introduce XSS.
**Prevention:** Always use `textContent` for user-provided data. If structural HTML is needed, create the structure first (via `innerHTML` or `createElement`), then find the specific text node or element that should hold the user data and set its `textContent`.

## 2026-06-21 - Systemic DOM-XSS Refactoring
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) in `unit-converter`, `qrcode-site`, and `base64-converter`.
**Learning:** The "structural HTML + textContent" pattern is robust but requires careful selection of child elements (e.g., `.result-value`, `.file-name`). It's a common pattern in this monorepo to use template literals for complex result cards, which often leads to accidental XSS.
**Prevention:** Standardize on a "render structure, then populate data" approach for all tool result displays.
