import type { Page } from "playwright/test";
import { afterEach, describe, expect, it, vi } from "vitest";
import openQueryBarStory from "./openQueryBarStory.js";

const { toBeVisible } = vi.hoisted(() => ({
  toBeVisible: vi.fn(async () => {}),
}));
vi.mock("playwright/test", () => ({ expect: () => ({ toBeVisible }) }));

type Preview = { readonly currentRender?: { readonly phase?: string } };

/** Set the preview Storybook publishes on the window, or remove it. */
const setPreview = (preview: Preview | undefined): void => {
  (
    window as { __STORYBOOK_PREVIEW__?: Preview | undefined }
  ).__STORYBOOK_PREVIEW__ = preview;
};

afterEach(() => {
  setPreview(undefined);
  toBeVisible.mockClear();
});

describe("openQueryBarStory", () => {
  it("opens the story alone, waits for its play, then for a row", async () => {
    const settled: boolean[] = [];
    const nth = vi.fn(() => "second row");
    const page = {
      goto: vi.fn(async () => null),
      waitForFunction: vi.fn(
        async (
          isSettled: (phases: readonly string[]) => boolean,
          phases: readonly string[],
        ) => {
          setPreview(undefined);
          settled.push(isSettled(phases));
          setPreview({ currentRender: { phase: "playing" } });
          settled.push(isSettled(phases));
          setPreview({ currentRender: { phase: "completed" } });
          settled.push(isSettled(phases));
        },
      ),
      locator: vi.fn(() => ({ nth })),
    };
    await openQueryBarStory(page as unknown as Page, "default");
    expect(page.goto).toHaveBeenCalledWith(
      "/iframe.html?id=work-in-progress-dataviews-querybar--default&viewMode=story",
    );
    expect(settled).toEqual([false, false, true]);
    expect(page.locator).toHaveBeenCalledWith("#storybook-root [role=row]");
    expect(nth).toHaveBeenCalledWith(1);
    expect(toBeVisible).toHaveBeenCalledTimes(1);
  });
});
