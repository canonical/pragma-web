import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import "../../../../../../.storybook/styles.css";
import { FileUploadInput } from "../../index.js";

const file = (name: string, size: number, type: string) =>
  new File(["x".repeat(size)], name, { type });

describe("Thumbnail preview", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the whole image in a tooltip on hover, from the same URL", async () => {
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:preview");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const page = await render(FileUploadInput, {
      files: [file("photo.png", 10, "image/png")],
    });
    const area = page.container.querySelector(
      ".tile > .thumbnail-preview",
    ) as HTMLElement;
    expect(area.querySelector(".target > .thumbnail > img")).not.toBeNull();
    area.dispatchEvent(new PointerEvent("pointerenter"));

    await expect
      .poll(() =>
        document
          .querySelector(".ds.tooltip.file-upload-preview")
          ?.getAttribute("aria-hidden"),
      )
      .toBe("false");
    const preview = document.querySelector(
      ".ds.tooltip.file-upload-preview img",
    ) as HTMLImageElement;
    expect(preview.getAttribute("src")).toBe("blob:preview");
    expect(preview.getAttribute("alt")).toBe("");
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    // The full image: 252px wide (the tooltip's max width less its
    // padding), at most half the viewport tall, scaled to fit.
    const style = getComputedStyle(preview);
    expect(style.width).toBe("252px");
    expect(style.maxHeight).toBe(`${window.innerHeight / 2}px`);
    expect(style.objectFit).toBe("contain");
  });
});
