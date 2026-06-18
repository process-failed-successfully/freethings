# Sentinel 🛡️ - Security Journal

## 2025-05-14 - XSS via innerHTML in Text Tools
**Vulnerability:** User-controlled output was rendered using `innerHTML` in several tools (Base64 Converter, Text Case Converter), allowing for DOM-based XSS when malicious input is processed.
**Learning:** Even simple utility tools that transform text can be vectors for XSS if they don't treat the output as plain text. The use of `innerHTML` for both structure and content is a common but dangerous pattern.
**Prevention:** Use `textContent` for any user-provided or transformed data. If HTML structure is needed, create elements programmatically or use `innerHTML` for static templates only, then update specific nodes with `textContent`.
