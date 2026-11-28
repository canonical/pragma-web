import { flushSync, hydrate, unmount } from "svelte";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import HydrationThumbnail from "../../../../../testing/HydrationThumbnail.fixtures.svelte";
import serveFixture from "../../../../../testing/serveFixture.js";

describe("Thumbnail preview hydration", () => {
  it("adopts the server thumbnail and portals the preview only after mount", async () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:preview");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn");
    onTestFinished(() => {
      vi.restoreAllMocks();
    });

    const container = await serveFixture("HydrationThumbnail");
    // The server has no object URL, so it draws the empty box and no preview.
    const box = container.querySelector(".tile > .thumbnail");
    expect(box?.childElementCount).toBe(0);
    expect(container.querySelector(".thumbnail-preview")).toBeNull();

    const app = hydrate(HydrationThumbnail, { target: container });
    flushSync();
    onTestFinished(() => {
      unmount(app);
      container.remove();
    });

    expect(warn.mock.calls.flat().join(" ")).not.toContain("hydration");
    await expect
      .poll(() => container.querySelector(".thumbnail-preview .thumbnail img"))
      .not.toBeNull();
    const tooltip = document.body.querySelector(
      ".ds.tooltip.file-upload-preview",
    );
    expect(tooltip?.querySelector("img")?.getAttribute("src")).toBe(
      "blob:preview",
    );
    // Portalled to the body, outside the tooltip area.
    expect(tooltip?.closest(".ds.tooltip-area")).toBeNull();
  });
});
