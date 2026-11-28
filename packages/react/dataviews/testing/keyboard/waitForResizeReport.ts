import type { Locator } from "playwright/test";

/**
 * Wait for the element's next size report, delivered with the page's own
 * observers.
 *
 * @note Impure: observes the element in the page.
 */
export default async function waitForResizeReport(
  locator: Locator,
): Promise<void> {
  await locator.evaluate(
    (element) =>
      new Promise<void>((resolve) => {
        const observer = new ResizeObserver(() => {
          observer.disconnect();
          resolve();
        });
        observer.observe(element);
      }),
  );
}
