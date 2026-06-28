## 2026-06-22 - [Optimizing Batch Image Processing]
**Learning:** Sequential processing of images using `await` in a loop significantly increases latency for batch operations. Additionally, `FileReader.readAsDataURL` creates large Base64 strings (33% overhead) which causes memory pressure and asynchronous UI delays.
**Action:** Use `Promise.all` with `Array.map` to parallelize image operations. Utilize `URL.createObjectURL` to create persistent pointers to binary data for synchronous, high-performance UI updates, ensuring strict manual cleanup via `URL.revokeObjectURL` in all lifecycle paths (remove, clear, re-run).

## 2026-06-23 - [Eliminating Artificial UI Latency]
**Learning:** Utility tools in this monorepo sometimes use `setTimeout` to "simulate processing," which creates unnecessary latency for lightweight operations.
**Action:** Replace artificial delays with debouncing (e.g., 200ms) on input events to prevent redundant processing while maintaining near-instant response times once the debounce period expires.
