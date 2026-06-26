## 2026-06-22 - [Optimizing Batch Image Processing]
**Learning:** Sequential processing of images using `await` in a loop significantly increases latency for batch operations. Additionally, `FileReader.readAsDataURL` creates large Base64 strings (33% overhead) which causes memory pressure and asynchronous UI delays.
**Action:** Use `Promise.all` with `Array.map` to parallelize image operations. Utilize `URL.createObjectURL` to create persistent pointers to binary data for synchronous, high-performance UI updates, ensuring strict manual cleanup via `URL.revokeObjectURL` in all lifecycle paths (remove, clear, re-run).

## 2026-06-27 - [Removing Artificial Latency and redundant processing]
**Learning:** Artificial delays (e.g., `setTimeout` for "processing simulation") are common anti-patterns in this codebase's legacy tools. While intended for UX, they degrade perceived performance. Additionally, missing debouncing on text inputs leads to O(n) execution frequency where n is the number of keystrokes.
**Action:** Remove all artificial `setTimeout` delays in calculation paths. Implement 200ms debouncing on `input` events for all text-based analysis or conversion tools to ensure efficiency and prevent UI jank during rapid typing.
