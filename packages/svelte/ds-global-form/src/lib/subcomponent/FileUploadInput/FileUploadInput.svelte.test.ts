import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Bound from "../../../testing/Bound.fixtures.svelte";
import readBound from "../../../testing/readBound.js";
import { FileUploadInput } from "./index.js";

const image = new File(["png"], "photo.png", {
  type: "image/png",
  lastModified: 1,
});
const text = new File(["txt"], "notes.txt", {
  type: "text/plain",
  lastModified: 2,
});

/** Reads the names of the files the harness holds. */
function readNames(container: HTMLElement) {
  return [...container.querySelectorAll(".file-name")].map(
    (node) => node.textContent,
  );
}

/** Dispatches a drag event carrying the given files. */
function drag(target: Element, type: string, files: File[] = []) {
  const dataTransfer = new DataTransfer();
  for (const file of files) dataTransfer.items.add(file);
  target.dispatchEvent(
    new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer }),
  );
}

describe("FileUploadInput", () => {
  it("adds chosen files, previews images and removes a file", async () => {
    const page = await render(Bound, {
      of: FileUploadInput,
      binding: "files",
      multiple: true,
      maxFiles: 3,
      maxSize: 10,
    });
    const input = page.container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await userEvent.upload(input, [image, text]);
    await expect
      .poll(() => readNames(page.container))
      .toEqual(["photo.png", "notes.txt"]);
    expect(
      page.container.querySelector("img.file-preview")?.getAttribute("alt"),
    ).toBe("Preview of photo.png");
    expect(
      page.container.querySelector(".drop-zone")?.hasAttribute("maxfiles"),
    ).toBe(false);
    await page.getByRole("button", { name: "Remove photo.png" }).click();
    await expect.poll(() => readNames(page.container)).toEqual(["notes.txt"]);
  });

  it("keeps the selection when the picker closes without a choice", async () => {
    const page = await render(Bound, {
      of: FileUploadInput,
      binding: "files",
      value: [text],
    });
    const input = page.container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await expect.poll(() => input.files?.length).toBe(1);
    // Some browsers fire `change` with no files when the picker is cancelled.
    input.files = new DataTransfer().files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await expect.poll(() => readNames(page.container)).toEqual(["notes.txt"]);
  });

  it("lists the same file added twice and revokes removed previews", async () => {
    const revoke = vi.spyOn(URL, "revokeObjectURL");
    const page = await render(Bound, {
      of: FileUploadInput,
      binding: "files",
      multiple: true,
    });
    const zone = page.container.querySelector(".drop-zone") as HTMLElement;
    drag(zone, "drop", [image]);
    drag(zone, "drop", [image]);
    await expect
      .poll(() => readNames(page.container))
      .toEqual(["photo.png", "photo.png"]);
    const preview = page.container.querySelector(
      "img.file-preview",
    ) as HTMLImageElement;
    expect(preview.src).toMatch(/^blob:/);
    await page
      .getByRole("button", { name: "Remove photo.png" })
      .first()
      .click();
    await expect.poll(() => readNames(page.container)).toEqual(["photo.png"]);
    expect(revoke).toHaveBeenCalledOnce();
    revoke.mockRestore();
  });

  it("keeps one file when not multiple, and ignores an empty choice", async () => {
    const page = await render(Bound, { of: FileUploadInput, binding: "files" });
    const input = page.container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(image);
    dataTransfer.items.add(text);
    input.files = dataTransfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await expect.poll(() => readNames(page.container)).toEqual(["photo.png"]);
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await expect.poll(() => readNames(page.container)).toEqual(["photo.png"]);
  });

  it("accepts dropped files and shows the drag state", async () => {
    const page = await render(Bound, {
      of: FileUploadInput,
      binding: "files",
      multiple: true,
    });
    const zone = page.container.querySelector(".drop-zone") as HTMLElement;
    drag(zone, "dragover");
    await expect.poll(() => zone.classList.contains("drag-over")).toBe(true);
    expect(zone.textContent).toContain("Drop files here");
    drag(zone, "dragleave");
    await expect.poll(() => zone.classList.contains("drag-over")).toBe(false);
    drag(zone, "drop");
    await expect.poll(() => readBound(page.container)).toBeNull();
    drag(zone, "drop", [text]);
    await expect.poll(() => readNames(page.container)).toEqual(["notes.txt"]);
  });

  it("opens the file picker from the keyboard", async () => {
    const page = await render(FileUploadInput, {});
    const input = page.container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    let opened = 0;
    input.addEventListener("click", (event) => {
      event.preventDefault();
      opened += 1;
    });
    const zone = page.container.querySelector(".drop-zone") as HTMLElement;
    zone.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    zone.dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", bubbles: true }),
    );
    zone.dispatchEvent(
      new KeyboardEvent("keydown", { key: "a", bubbles: true }),
    );
    expect(opened).toBe(2);
  });

  it("names the file input beside the drop zone and mirrors the bound files into it", async () => {
    const page = await render(Bound, {
      of: FileUploadInput,
      binding: "files",
      id: "upload",
      name: "upload",
      required: true,
      multiple: true,
      "aria-labelledby": "upload-label",
    });
    const zone = page.container.querySelector(".drop-zone") as HTMLElement;
    const input = page.container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(zone.contains(input)).toBe(false);
    expect(zone.getAttribute("aria-labelledby")).toBe("upload-label");
    expect(zone.hasAttribute("name")).toBe(false);
    expect(input.id).toBe("upload");
    expect(input.name).toBe("upload");
    expect(input.required).toBe(true);
    expect(input.validity.valueMissing).toBe(true);
    drag(zone, "drop", [image, text]);
    await expect
      .poll(() => [...(input.files ?? [])].map((file) => file.name))
      .toEqual(["photo.png", "notes.txt"]);
    expect(input.validity.valueMissing).toBe(false);
    await page.getByRole("button", { name: "Remove photo.png" }).click();
    await expect
      .poll(() => [...(input.files ?? [])].map((file) => file.name))
      .toEqual(["notes.txt"]);
  });

  it("ignores interaction while disabled", async () => {
    const page = await render(Bound, {
      of: FileUploadInput,
      binding: "files",
      disabled: true,
    });
    const zone = page.container.querySelector(".drop-zone") as HTMLElement;
    const input = page.container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    let opened = 0;
    input.addEventListener("click", () => {
      opened += 1;
    });
    zone.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    drag(zone, "dragover");
    drag(zone, "drop", [text]);
    expect(opened).toBe(0);
    expect(zone.classList.contains("drag-over")).toBe(false);
    await expect.poll(() => readBound(page.container)).toBeNull();
  });
});
