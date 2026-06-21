## 2024-05-24 - DOM-based XSS in UUID Generator
**Vulnerability:** DOM-based XSS through user-controlled input in the 'Timestamp ID' prefix field. The prefix was directly injected into the DOM via `innerHTML` without sanitization.
**Learning:** Structural templates using backticks and `innerHTML` often hide vulnerabilities where user data is concatenated. In this case, `displayUUID`, `generateMultipleUUIDs`, and `updateHistoryDisplay` all had similar patterns.
**Prevention:** Always use `textContent` for user-controlled or dynamic data. For complex structures, set the static HTML first and then use `querySelector` and `textContent` to fill in the data, or build the DOM programmatically using `document.createElement`.
