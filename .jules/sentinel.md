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

## 2026-06-22 - DOM-XSS in Reading Helper & Data Integrity
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) in `reading-helper` (both standard and lite versions). User-provided book titles and custom story text were injected via `innerHTML`.
**Learning:** The systemic use of template literals for UI components in this repo frequently leads to XSS. Additionally, a syntax error (double comma) in `data.js` caused a runtime crash when trying to access `books[0].id` because a null element was inserted into the array.
**Prevention:** Migrate to `document.createElement` and `textContent` for all dynamic list rendering. Replace inline `onerror` and `onclick` with programmatic listeners. Always validate data array integrity after manual edits.
