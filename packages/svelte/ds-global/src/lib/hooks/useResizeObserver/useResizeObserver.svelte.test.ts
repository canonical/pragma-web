import { flushSync } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import { useResizeObserver } from "./index.js";

describe("useResizeObserver", () => {
  const element = document.createElement("div");

  afterEach(() => {
    element.remove();
  });

  it("reports 0×0 without an element", () => {
    let size!: ReturnType<typeof useResizeObserver>;
    const destroy = $effect.root(() => {
      size = useResizeObserver(() => undefined);
    });
    flushSync();
    expect(size).toMatchObject({ width: 0, height: 0 });
    destroy();
  });

  it("seeds the border-box size and follows changes", async () => {
    element.style.cssText = "width: 40px; height: 20px; padding: 5px;";
    document.body.append(element);
    let size!: ReturnType<typeof useResizeObserver>;
    const destroy = $effect.root(() => {
      size = useResizeObserver(() => element);
    });
    flushSync();
    expect(size.width).toBe(50);
    expect(size.height).toBe(30);

    element.style.width = "90px";
    await expect.poll(() => size.width).toBe(100);
    expect(size.height).toBe(30);
    destroy();
  });
});
