# Sentinel Security Journal 🛡️

## 2025-05-14 - [DOM-based XSS in Text Tools]
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) via `innerHTML` in text processing tools.
**Learning:** Tools that process user input and display it back (e.g., converters, generators) were using `innerHTML` to render results, allowing script execution if the input contained malicious HTML/JS.
**Prevention:** Always use `textContent` or `innerText` for rendering user-provided or processed text. For complex structures, use `innerHTML` for static parts and `textContent` for dynamic content in specific sub-elements.
