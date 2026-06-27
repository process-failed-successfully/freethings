## 2026-06-22 - [Optimizing Batch Image Processing]
**Learning:** Sequential processing of images using `await` in a loop significantly increases latency for batch operations. Additionally, `FileReader.readAsDataURL` creates large Base64 strings (33% overhead) which causes memory pressure and asynchronous UI delays.
**Action:** Use `Promise.all` with `Array.map` to parallelize image operations. Utilize `URL.createObjectURL` to create persistent pointers to binary data for synchronous, high-performance UI updates, ensuring strict manual cleanup via `URL.revokeObjectURL` in all lifecycle paths (remove, clear, re-run).

## 2026-06-27 - [Removing Artificial UX Latency]
**Learning:** Some tools may include artificial delays (e.g., 300ms setTimeout) intended to "simulate processing" for UX reasons, but these objectively degrade performance. Combining the removal of such delays with a proper debounce (e.g., 200ms) on input events provides a much snappier user experience while still preventing redundant processing during rapid typing.
**Action:** Identify and remove artificial delays in simple utility tools. Implement debouncing for real-time input fields to balance responsiveness with processing efficiency.
