/**
 * Watch the first chip `selector` finds: record when the pointer first
 * enters it, when focus first moves into it, and when a peek is first
 * mounted on the document's body, in the page's own clock, for
 * `measurePeek` to read back. It runs in the browser and names nothing
 * from outside its own body: Playwright serialises it into the page.
 *
 * @param selector - The chip's root.
 * @note Impure: listens on the chip, observes the document's body and
 *   sets `__prismPeekTimes` on the window.
 */
export default function watchPeek(selector: string): void {
  const chip = document.querySelector(selector);
  if (chip === null) throw new Error(`no chip matches ${selector}`);
  const times: { entered?: number; focused?: number; opened?: number } = {};
  Reflect.set(window, "__prismPeekTimes", times);
  chip.addEventListener("pointerenter", () => {
    times.entered ??= performance.now();
  });
  chip.addEventListener("focusin", () => {
    times.focused ??= performance.now();
  });
  new MutationObserver(() => {
    if (document.querySelector("body > .ds.peek") !== null) {
      times.opened ??= performance.now();
    }
  }).observe(document.body, { childList: true });
}
