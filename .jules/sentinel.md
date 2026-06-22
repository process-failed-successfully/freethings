## 2025-05-14 - DOM-based XSS in Text Tools
**Vulnerability:** User-controlled input was being rendered using `innerHTML` in several text-based tools (e.g., `text-case-converter`, `base64-converter`, `unit-converter`), leading to DOM-based XSS vulnerabilities.
**Learning:** Vanilla JavaScript tools often use `innerHTML` for convenience when updating results, but this is dangerous when the data comes from user input.
**Prevention:** Always use `textContent` or `innerText` for rendering user-provided data. If structural HTML is needed, set the structure with `innerHTML` (using static strings) and then update specific text nodes with `textContent`.
