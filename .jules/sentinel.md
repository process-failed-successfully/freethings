## 2026-06-16 - DOM-based XSS in Text Tools
**Vulnerability:** User-controlled input from text conversion tools was injected into the DOM using `innerHTML`. This allowed execution of malicious scripts via payloads like `<details open ontoggle='...'>` or Base64-encoded HTML.
**Learning:** Even simple text manipulation tools are vulnerable to XSS if the result is reflected using `innerHTML`. Automated conversion triggers (like on input or on operation change) can lead to immediate exploitation.
**Prevention:** Always use `textContent` or `innerText` when reflecting user-provided or user-manipulated text. Avoid `innerHTML` unless the content is explicitly sanitized or contains trusted, hardcoded HTML templates.
