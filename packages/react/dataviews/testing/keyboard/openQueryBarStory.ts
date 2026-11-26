/**
 * Opens one QueryBar story for the Chromium journeys, as a reader first
 * finds it: drawn, its play done, its table holding rows.
 */

import { expect, type Page } from "playwright/test";

/** The render phases after which a story is drawn and its play done. */
const SETTLED_PHASES: readonly string[] = ["completed", "finished"];

/**
 * Open one QueryBar story alone, and wait until its play has finished and
 * its table holds rows.
 *
 * @note Impure: navigates the page.
 */
export default async function openQueryBarStory(
  page: Page,
  name: string,
): Promise<void> {
  await page.goto(
    `/iframe.html?id=work-in-progress-dataviews-querybar--${name}&viewMode=story`,
  );
  await page.waitForFunction((phases) => {
    const preview = (
      window as {
        readonly __STORYBOOK_PREVIEW__?: {
          readonly currentRender?: { readonly phase?: string };
        };
      }
    ).__STORYBOOK_PREVIEW__;
    const phase = preview?.currentRender?.phase;
    return phase !== undefined && phases.includes(phase);
  }, SETTLED_PHASES);
  await expect(
    page.locator("#storybook-root").getByRole("row").nth(1),
  ).toBeVisible();
}
