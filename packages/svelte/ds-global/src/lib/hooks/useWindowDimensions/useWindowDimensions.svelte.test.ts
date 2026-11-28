import { flushSync } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { useWindowDimensions } from "./index.js";

describe("useWindowDimensions", () => {
  it("reads the window size and scroll position", () => {
    let dimensions!: ReturnType<typeof useWindowDimensions>;
    const destroy = $effect.root(() => {
      dimensions = useWindowDimensions();
    });
    expect(dimensions.windowWidth).toBe(window.innerWidth);
    expect(dimensions.windowHeight).toBe(window.innerHeight);
    expect(dimensions.scrollWidth).toBe(window.scrollX);
    expect(dimensions.scrollHeight).toBe(window.scrollY);
    destroy();
  });

  it("calls back, debounced, on resize and scroll", async () => {
    const onResize = vi.fn();
    const onScroll = vi.fn();
    const destroy = $effect.root(() => {
      useWindowDimensions(() => ({
        onResize,
        onScroll,
        resizeDelay: 10,
        scrollDelay: 10,
      }));
    });
    flushSync();
    // The initial trigger runs both once after mount.
    await expect.poll(() => onResize.mock.calls.length).toBe(1);
    await expect.poll(() => onScroll.mock.calls.length).toBe(1);

    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("scroll"));
    await expect.poll(() => onResize.mock.calls.length).toBe(2);
    await expect.poll(() => onScroll.mock.calls.length).toBe(2);
    destroy();
  });

  it("cancels pending updates when destroyed", () => {
    vi.useFakeTimers();
    try {
      const destroy = $effect.root(() => {
        useWindowDimensions();
      });
      flushSync();
      expect(vi.getTimerCount()).toBeGreaterThan(0);
      destroy();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
