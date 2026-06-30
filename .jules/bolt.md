## 2026-06-22 - [Optimizing Batch Image Processing]
**Learning:** Sequential processing of images using `await` in a loop significantly increases latency for batch operations. Additionally, `FileReader.readAsDataURL` creates large Base64 strings (33% overhead) which causes memory pressure and asynchronous UI delays.
**Action:** Use `Promise.all` with `Array.map` to parallelize image operations. Utilize `URL.createObjectURL` to create persistent pointers to binary data for synchronous, high-performance UI updates, ensuring strict manual cleanup via `URL.revokeObjectURL` in all lifecycle paths (remove, clear, re-run).

## 2026-06-25 - [Scroll & Animation Performance Patterns]
**Learning:** High-frequency events (scroll) and animations (setInterval) are common performance bottlenecks in static sites. Unthrottled scroll listeners cause layout thrashing, while setInterval-based animations are decoupled from the display refresh rate and waste CPU cycles when the page is inactive. IntersectionObservers that don't terminate also contribute to background overhead.
**Action:** Always throttle scroll listeners using a 'ticking' flag and `requestAnimationFrame`, and mark them as `{ passive: true }`. Replace all `setInterval` animations with `requestAnimationFrame` loops for 60fps synchronization. Explicitly call `unobserve()` on elements once their intersection-triggered action (like reveal animations) is complete.

## 2026-06-27 - [Removing Artificial UX Latency]
**Learning:** Some tools may include artificial delays (e.g., 300ms setTimeout) intended to "simulate processing" for UX reasons, but these objectively degrade performance. Combining the removal of such delays with a proper debounce (e.g., 200ms) on input events provides a much snappier user experience while still preventing redundant processing during rapid typing.
**Action:** Identify and remove artificial delays in simple utility tools. Implement debouncing for real-time input fields to balance responsiveness with processing efficiency.

## 2026-06-30 - [DocumentFragment Batching for Worksheet Generation]
**Learning:** Building large, multi-page worksheets with hundreds of small visual elements (counting aids, problem items) using string concatenation and `innerHTML` causes significant overhead due to repeated DOM parsing and layout thrashing.
**Action:** Use `document.createDocumentFragment()` to batch all page and problem elements off-screen. Implement programmatic DOM construction (`document.createElement`, `.textContent`) instead of template literals to improve both rendering performance and XSS security. In the worksheet generator, this reduced latency by ~55%.

## 2026-07-02 - [Optimizing Async Generation and DOM Rendering in UUID Tool]
**Learning:** Sequential 'await' calls in loops for asynchronous generation (like UUID v5) create unnecessary latency. Additionally, updating the DOM for each generated item or history entry causes significant layout thrashing.
**Action:** Use 'Promise.all' with 'Array.from().map()' to parallelize asynchronous generation tasks. Implement 'document.createDocumentFragment()' to batch all DOM updates (multiple results or history lists) off-screen, ensuring a single reflow and significantly smoother UI performance.
