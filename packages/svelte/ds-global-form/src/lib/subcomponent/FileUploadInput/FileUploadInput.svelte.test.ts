import { createRawSnippet, flushSync, tick } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import Bound from "../../../testing/Bound.fixtures.svelte";
import readBound from "../../../testing/readBound.js";
import { RESULT_DISPLAY_DURATION } from "./constants.js";
import { FileUploadInput } from "./index.js";
import type { UploadOptions } from "./types.js";

const file = (name: string, size = 1, type = "text/plain"): File => {
  const created = new File(["x"], name, { type, lastModified: 0 });
  Object.defineProperty(created, "size", { value: size });
  return created;
};

const nativeInput = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement;
const dropArea = (container: HTMLElement) =>
  container.querySelector(".drop-area") as HTMLElement;
const chooseButton = (container: HTMLElement) =>
  container.querySelector(".drop-area > button") as HTMLButtonElement;
const button = (container: HTMLElement, name: string) =>
  container.querySelector(`button[aria-label="${name}"]`) as HTMLButtonElement;
const readNames = (container: HTMLElement) =>
  [...container.querySelectorAll(".file-name")].map((node) => node.textContent);

/** Chooses files through the native input, as the file picker does. */
function choose(container: HTMLElement, files: File[]) {
  const input = nativeInput(container);
  const transfer = new DataTransfer();
  for (const chosen of files) transfer.items.add(chosen);
  input.files = transfer.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

/** Dispatches a drag event carrying the given files. */
function drag(
  target: Element,
  type: string,
  files: File[] = [],
  relatedTarget: EventTarget | null = null,
) {
  const dataTransfer = new DataTransfer();
  for (const dragged of files) dataTransfer.items.add(dragged);
  target.dispatchEvent(
    new DragEvent(type, {
      bubbles: true,
      cancelable: true,
      dataTransfer,
      relatedTarget,
    }),
  );
}

/** A field-level error, as the field hands it to the input. */
const fieldError = createRawSnippet(() => ({
  render: () => '<p class="field-error">Too many files.</p>',
}));

/** A controllable upload: each call is recorded with its own settle hooks. */
const deferredUpload = () => {
  const calls: {
    file: File;
    options: UploadOptions;
    resolve: () => void;
    reject: (reason: unknown) => void;
  }[] = [];
  const upload = vi.fn(
    (uploaded: File, options: UploadOptions) =>
      new Promise<void>((resolve, reject) => {
        calls.push({ file: uploaded, options, resolve, reject });
      }),
  );
  return { upload, calls };
};

describe("FileUploadInput (presentational)", () => {
  it("renders the drop area and the Choose file button without a form", async () => {
    const page = await render(FileUploadInput, {});
    expect(dropArea(page.container).textContent).toContain("Drag and drop or");
    const choose = chooseButton(page.container);
    expect(choose.textContent).toBe("Choose file");
    expect(choose.type).toBe("button");
    expect(choose.className).toBe("ds button secondary");
    expect(choose.querySelector("use")?.getAttribute("href")).toBe(
      "/icons/upload.svg#upload",
    );
  });

  it("names the button for several files when multiple", async () => {
    const page = await render(FileUploadInput, { multiple: true });
    expect(chooseButton(page.container).textContent).toBe("Choose files");
  });

  it("puts the root classes and other props on the root element", async () => {
    const page = await render(FileUploadInput, {
      class: "extra",
      disabled: true,
      "data-testid": "root",
    } as never);
    const root = page.container.querySelector(".ds.input.file-upload");
    expect(root?.className).toBe("ds input file-upload disabled extra");
    expect(root?.getAttribute("data-testid")).toBe("root");
  });

  it("keeps a hidden native input with the accept list beside the drop area", async () => {
    const page = await render(FileUploadInput, {
      accept: "image/*",
      multiple: true,
    });
    const input = nativeInput(page.container);
    expect(input.accept).toBe("image/*");
    expect(input.multiple).toBe(true);
    expect(input.tabIndex).toBe(-1);
    expect(input.getAttribute("aria-hidden")).toBe("true");
    expect(input.parentElement?.classList.contains("file-upload")).toBe(true);
    expect(dropArea(page.container).contains(input)).toBe(false);
  });

  it("puts the id, name and required on the native input, not the button", async () => {
    const page = await render(FileUploadInput, {
      id: "upload",
      name: "upload",
      required: true,
    });
    const input = nativeInput(page.container);
    expect(input.id).toBe("upload");
    expect(input.name).toBe("upload");
    expect(input.required).toBe(true);
    const choose = chooseButton(page.container);
    expect(choose.id).not.toBe("upload");
    expect(choose.hasAttribute("name")).toBe(false);
    expect(choose.hasAttribute("required")).toBe(false);
    expect(page.container.querySelector(".file-upload")?.id).toBe("");
  });

  it("names the button by the field label and its own text", async () => {
    const page = await render(FileUploadInput, {
      "aria-labelledby": "label",
      "aria-describedby": "description",
      "aria-invalid": true,
      "aria-errormessage": "error",
    });
    const choose = chooseButton(page.container);
    expect(choose.getAttribute("aria-labelledby")).toBe(`label ${choose.id}`);
    expect(choose.getAttribute("aria-describedby")).toBe("description");
    expect(choose.getAttribute("aria-invalid")).toBe("true");
    expect(choose.getAttribute("aria-errormessage")).toBe("error");
    const unlabelled = await render(FileUploadInput, {});
    expect(
      chooseButton(unlabelled.container).hasAttribute("aria-labelledby"),
    ).toBe(false);
  });

  it("opens the file picker from the button", async () => {
    const page = await render(FileUploadInput, {});
    const click = vi.fn((event: Event) => event.preventDefault());
    nativeInput(page.container).addEventListener("click", click);
    chooseButton(page.container).click();
    expect(click).toHaveBeenCalledOnce();
  });

  it("binds the chosen files and clears the native value", async () => {
    const page = await render(Bound, {
      of: FileUploadInput,
      binding: "files",
      multiple: true,
    });
    choose(page.container, [file("a.txt"), file("b.txt")]);
    await expect
      .poll(() => readNames(page.container))
      .toEqual(["a.txt", "b.txt"]);
    expect(readBound(page.container)).toEqual([{}, {}]);
    choose(page.container, [file("c.txt")]);
    await expect
      .poll(() => readNames(page.container))
      .toEqual(["a.txt", "b.txt", "c.txt"]);
  });

  it("keeps only the first file in single-file mode", async () => {
    const page = await render(Bound, { of: FileUploadInput, binding: "files" });
    choose(page.container, [file("a.txt"), file("b.txt")]);
    await expect.poll(() => readNames(page.container)).toEqual(["a.txt"]);
  });

  it("ignores a change with no files", async () => {
    const page = await render(Bound, {
      of: FileUploadInput,
      binding: "files",
      value: [file("a.txt")],
      multiple: true,
    });
    // Some browsers fire `change` with no files when the picker is cancelled.
    choose(page.container, []);
    await tick();
    expect(readNames(page.container)).toEqual(["a.txt"]);
  });

  describe("drag and drop", () => {
    it("shows the drag-over state while a file is over the area", async () => {
      const page = await render(FileUploadInput, { multiple: true });
      const area = dropArea(page.container);
      drag(area, "dragover");
      await expect.poll(() => area.classList.contains("drag-over")).toBe(true);
      // Moving onto the button inside is not leaving the area.
      drag(area, "dragleave", [], chooseButton(page.container));
      await tick();
      expect(area.classList.contains("drag-over")).toBe(true);
      drag(area, "dragleave");
      await expect.poll(() => area.classList.contains("drag-over")).toBe(false);
    });

    it("adds dropped files, and ignores a drop with none", async () => {
      const page = await render(Bound, {
        of: FileUploadInput,
        binding: "files",
        multiple: true,
      });
      const area = dropArea(page.container);
      drag(area, "dragover");
      drag(area, "drop");
      await expect.poll(() => area.classList.contains("drag-over")).toBe(false);
      expect(readBound(page.container)).toBeNull();
      drag(area, "drop", [file("a.txt")]);
      await expect.poll(() => readNames(page.container)).toEqual(["a.txt"]);
    });

    it("ignores dragging and dropping while disabled", async () => {
      const page = await render(Bound, {
        of: FileUploadInput,
        binding: "files",
        disabled: true,
      });
      const area = dropArea(page.container);
      drag(area, "dragover");
      drag(area, "drop", [file("a.txt")]);
      await tick();
      expect(area.classList.contains("drag-over")).toBe(false);
      expect(readBound(page.container)).toBeNull();
    });
  });

  describe("the file list", () => {
    it("shows each file's name, with the full name as a tooltip, and size", async () => {
      const page = await render(FileUploadInput, {
        multiple: true,
        files: [file("report.pdf", 2048)],
      });
      const name = page.container.querySelector(".file-name") as HTMLElement;
      expect(name.textContent).toBe("report.pdf");
      expect(name.title).toBe("report.pdf");
      expect(page.container.querySelector(".file-size")?.textContent).toBe(
        "2 kB",
      );
    });

    it("hides the size when showFileSize is off", async () => {
      const page = await render(FileUploadInput, {
        showFileSize: false,
        files: [file("a.txt")],
      });
      expect(page.container.querySelector(".file-size")).toBeNull();
    });

    it("renders the size with the messages' format", async () => {
      const page = await render(FileUploadInput, {
        files: [file("a.txt", 3)],
        messages: { fileSize: (bytes) => `${bytes} octets` },
      });
      expect(page.container.querySelector(".file-size")?.textContent).toBe(
        "3 octets",
      );
    });

    it("removes a file with its remove button, and keeps the native input in step", async () => {
      const page = await render(Bound, {
        of: FileUploadInput,
        binding: "files",
        multiple: true,
        value: [file("a.txt"), file("b.txt")],
      });
      const input = nativeInput(page.container);
      await expect.poll(() => input.files?.length).toBe(2);
      button(page.container, "Remove a.txt").click();
      await expect.poll(() => readNames(page.container)).toEqual(["b.txt"]);
      await expect.poll(() => input.files?.[0]?.name).toBe("b.txt");
    });

    it("gives two files with the same name, or one file listed twice, their own tiles", async () => {
      const twice = file("a.txt");
      const page = await render(FileUploadInput, {
        multiple: true,
        files: [file("a.txt"), file("a.txt"), twice, twice],
      });
      expect(readNames(page.container)).toHaveLength(4);
    });

    it("draws no list when disabled", async () => {
      const page = await render(FileUploadInput, {
        disabled: true,
        multiple: true,
        files: [file("a.txt")],
      });
      expect(page.container.querySelector(".file-list")).toBeNull();
      expect(chooseButton(page.container).disabled).toBe(true);
    });

    it("draws no status for a file that is not uploaded live", async () => {
      const page = await render(FileUploadInput, { files: [file("a.txt")] });
      expect(page.container.querySelector(".file-status")).toBeNull();
    });
  });

  describe("image thumbnails", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("shows an image from an object URL and revokes it on removal", async () => {
      const createObjectURL = vi
        .spyOn(URL, "createObjectURL")
        .mockReturnValue("blob:preview");
      const revokeObjectURL = vi
        .spyOn(URL, "revokeObjectURL")
        .mockImplementation(() => {});
      const image = file("photo.png", 10, "image/png");
      const page = await render(FileUploadInput, { files: [image] });
      const preview = page.container.querySelector(".thumbnail > img");
      expect(preview?.getAttribute("src")).toBe("blob:preview");
      expect(preview?.getAttribute("alt")).toBe("");
      expect(createObjectURL).toHaveBeenCalledWith(image);

      await page.rerender({ files: [] });
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:preview");
    });

    it("keeps the thumbnail box empty where object URLs are unsupported", async () => {
      const original = URL.createObjectURL;
      // biome-ignore lint/suspicious/noExplicitAny: removes a browser API
      (URL as any).createObjectURL = undefined;
      try {
        const page = await render(FileUploadInput, {
          files: [file("photo.png", 10, "image/png")],
        });
        expect(
          page.container.querySelector(".thumbnail")?.childElementCount,
        ).toBe(0);
      } finally {
        URL.createObjectURL = original;
      }
    });

    it("draws no thumbnail for a file that is not an image", async () => {
      const page = await render(FileUploadInput, { files: [file("a.txt")] });
      expect(page.container.querySelector(".thumbnail")).toBeNull();
    });
  });

  describe("per-file messages", () => {
    it("errors on a file that accept does not allow, and links the message", async () => {
      const page = await render(FileUploadInput, {
        accept: ".pdf",
        files: [file("notes.txt")],
      });
      const tile = page.container.querySelector("li") as HTMLElement;
      const paragraph = page.container.querySelector(
        ".file-message",
      ) as HTMLElement;
      expect(paragraph.textContent).toBe("File type is not accepted.");
      expect(tile.className).toBe("file-item error");
      expect(tile.getAttribute("aria-describedby")).toBe(paragraph.id);
      expect(
        button(page.container, "Remove notes.txt").getAttribute(
          "aria-describedby",
        ),
      ).toBe(paragraph.id);
      const icon = paragraph.querySelector("svg") as SVGElement;
      expect(icon.getAttribute("role")).toBe("img");
      expect(icon.getAttribute("aria-label")).toBe("Error:");
      expect(icon.hasAttribute("aria-hidden")).toBe(false);
    });

    it("errors on a file larger than maxSize", async () => {
      const page = await render(FileUploadInput, {
        maxSize: 1024,
        files: [file("big.txt", 4096)],
      });
      expect(page.container.querySelector(".message-text")?.textContent).toBe(
        "File size exceeds 1 kB.",
      );
    });

    it("shows a validateFile warning", async () => {
      const page = await render(FileUploadInput, {
        files: [file("a.txt")],
        validateFile: () => ({
          level: "warning",
          message: "This file is large.",
        }),
      });
      expect(page.container.querySelector("li")?.className).toBe(
        "file-item warning",
      );
      expect(
        page.container.querySelector('svg[aria-label="Warning:"]'),
      ).not.toBeNull();
      expect(page.container.querySelector(".message-text")?.textContent).toBe(
        "This file is large.",
      );
    });

    it("renders no message for a valid file", async () => {
      const page = await render(FileUploadInput, {
        accept: "text/*",
        maxSize: 10,
        validateFile: () => undefined,
        files: [file("a.txt", 5)],
      });
      expect(page.container.querySelector(".file-message")).toBeNull();
      expect(
        page.container.querySelector("li")?.hasAttribute("aria-describedby"),
      ).toBe(false);
    });
  });

  describe("the drop area in single-file mode", () => {
    it("hides once a file is chosen and returns when it is removed", async () => {
      const page = await render(Bound, {
        of: FileUploadInput,
        binding: "files",
      });
      choose(page.container, [file("a.txt")]);
      await expect.poll(() => dropArea(page.container)).toBeNull();
      // The native input stays, so the file still posts.
      expect(nativeInput(page.container)).not.toBeNull();
      button(page.container, "Remove a.txt").click();
      await expect.poll(() => dropArea(page.container)).not.toBeNull();
    });

    it("keeps the field error while a chosen file hides the drop area", async () => {
      const page = await render(FileUploadInput, {
        files: [file("a.txt")],
        "aria-describedby": "field-error",
        error: fieldError,
      });
      expect(dropArea(page.container)).toBeNull();
      expect(
        page.container.querySelector(".drop-area-group > .field-error")
          ?.textContent,
      ).toBe("Too many files.");
      expect(
        button(page.container, "Remove a.txt").getAttribute("aria-describedby"),
      ).toBe("field-error");
    });

    it("stays when multiple", async () => {
      const page = await render(FileUploadInput, {
        multiple: true,
        files: [file("a.txt")],
      });
      expect(dropArea(page.container)).not.toBeNull();
    });
  });

  it("renders the field-level error under the drop area", async () => {
    const page = await render(FileUploadInput, { error: fieldError });
    expect(
      page.container.querySelector(".drop-area-group > .field-error")
        ?.textContent,
    ).toBe("Too many files.");
  });

  describe("the error state", () => {
    it("puts the error Criticality class on the drop area while invalid", async () => {
      const page = await render(FileUploadInput, {});
      const isError = () =>
        dropArea(page.container).classList.contains("error");
      expect(isError()).toBe(false);
      await page.rerender({ "aria-invalid": true });
      expect(isError()).toBe(true);
      await page.rerender({ "aria-invalid": "true" });
      expect(isError()).toBe(true);
      await page.rerender({ "aria-invalid": "false" });
      expect(isError()).toBe(false);
      await page.rerender({ "aria-invalid": undefined, error: fieldError });
      expect(isError()).toBe(true);
    });

    it("keeps the Criticality class off the Choose file button", async () => {
      const page = await render(FileUploadInput, { "aria-invalid": true });
      expect(chooseButton(page.container).classList.contains("error")).toBe(
        false,
      );
    });
  });

  describe("turning the parts off", () => {
    it("hides the drop area but keeps the field error with showDropArea off", async () => {
      const page = await render(FileUploadInput, {
        showDropArea: false,
        multiple: true,
        files: [file("a.txt")],
        error: fieldError,
      });
      expect(dropArea(page.container)).toBeNull();
      // The group stays, holding only the error.
      const group = page.container.querySelector(".drop-area-group");
      expect(group?.children).toHaveLength(1);
      expect(group?.querySelector(":scope > .field-error")?.textContent).toBe(
        "Too many files.",
      );
      // The native input stays, so the files still post, and the list shows.
      expect(nativeInput(page.container)).not.toBeNull();
      expect(readNames(page.container)).toEqual(["a.txt"]);
    });

    it("draws no group with showDropArea off and no error", async () => {
      const page = await render(FileUploadInput, {
        showDropArea: false,
        multiple: true,
        files: [file("a.txt")],
      });
      expect(page.container.querySelector(".drop-area-group")).toBeNull();
    });

    it("moves the field's description to the file actions without the drop area", async () => {
      const page = await render(FileUploadInput, {
        showDropArea: false,
        multiple: true,
        files: [file("a.txt"), file("b.exe")],
        accept: ".txt",
        "aria-describedby": "field-error",
        error: fieldError,
      });
      expect(
        button(page.container, "Remove a.txt").getAttribute("aria-describedby"),
      ).toBe("field-error");
      const [own, field] = (
        button(page.container, "Remove b.exe").getAttribute(
          "aria-describedby",
        ) ?? ""
      ).split(" ");
      expect(
        page.container.querySelector(`[id="${own}"]`)?.textContent,
      ).toContain("not accepted");
      expect(field).toBe("field-error");
    });

    it("leaves the file actions their own description while the drop area shows", async () => {
      const page = await render(FileUploadInput, {
        multiple: true,
        files: [file("a.txt")],
        "aria-describedby": "field-error",
      });
      expect(
        chooseButton(page.container).getAttribute("aria-describedby"),
      ).toBe("field-error");
      expect(
        button(page.container, "Remove a.txt").hasAttribute("aria-describedby"),
      ).toBe(false);
    });

    it("hides the file list with showFileList off", async () => {
      const page = await render(FileUploadInput, {
        showFileList: false,
        multiple: true,
        files: [file("a.txt")],
      });
      expect(page.container.querySelector(".file-list")).toBeNull();
      expect(dropArea(page.container)).not.toBeNull();
    });

    it("keeps the single-file drop area while the file list is off", async () => {
      const page = await render(FileUploadInput, {
        showFileList: false,
        files: [file("a.txt")],
      });
      expect(dropArea(page.container)).not.toBeNull();
    });
  });

  describe("mirroring the files into the native input", () => {
    it("leaves the native input alone where DataTransfer is unavailable", async () => {
      const original = globalThis.DataTransfer;
      // biome-ignore lint/suspicious/noExplicitAny: removes a browser API
      (globalThis as any).DataTransfer = undefined;
      try {
        const page = await render(FileUploadInput, {
          name: "docs",
          files: [file("a.txt")],
        });
        expect(nativeInput(page.container).files?.length).toBe(0);
      } finally {
        globalThis.DataTransfer = original;
      }
    });
  });
});

describe("FileUploadInput (live upload)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** Lets settled uploads run their callbacks, then renders. */
  const settle = async () => {
    for (let round = 0; round < 5; round += 1) await Promise.resolve();
    flushSync();
  };
  const status = (container: HTMLElement) =>
    container.querySelector(".file-status") as HTMLElement;

  it("uploads each chosen file with a signal and shows its progress", async () => {
    const { upload, calls } = deferredUpload();
    const chosen = file("a.txt");
    const page = await render(FileUploadInput, { upload, files: [chosen] });
    await settle();

    expect(upload).toHaveBeenCalledWith(chosen, expect.any(Object));
    expect(calls[0].options.signal.aborted).toBe(false);
    const region = status(page.container);
    expect(region.getAttribute("aria-live")).toBe("polite");
    expect(region.textContent).toBe("0%");
    const spinner = region.querySelector("svg") as SVGElement;
    expect(spinner.getAttribute("class")).toBe("ds spinner");
    expect(spinner.getAttribute("aria-label")).toBe("Uploading a.txt");
    expect(button(page.container, "Cancel upload of a.txt")).not.toBeNull();

    calls[0].options.onProgress(0.456);
    flushSync();
    expect(region.textContent).toBe("46%");
    // A report within the same whole percent changes nothing.
    calls[0].options.onProgress(0.4561);
    flushSync();
    expect(region.textContent).toBe("46%");
    calls[0].options.onProgress(4);
    flushSync();
    expect(region.textContent).toBe("100%");
    calls[0].options.onProgress(Number.NaN);
    flushSync();
    expect(region.textContent).toBe("0%");
  });

  it("shows the success icon briefly once the upload ends", async () => {
    const { upload, calls } = deferredUpload();
    const page = await render(FileUploadInput, {
      upload,
      files: [file("a.txt")],
    });
    await settle();
    calls[0].resolve();
    await settle();

    const region = status(page.container);
    expect(region.textContent).toBe("100%");
    const icon = region.querySelector("svg") as SVGElement;
    expect(icon.getAttribute("class")).toBe("ds icon");
    expect(icon.getAttribute("aria-label")).toBe("a.txt uploaded");
    expect(icon.querySelector("use")?.getAttribute("href")).toBe(
      "/icons/success-fill.svg#success-fill",
    );
    expect(button(page.container, "Remove a.txt")).not.toBeNull();

    vi.advanceTimersByTime(RESULT_DISPLAY_DURATION);
    flushSync();
    expect(region.childElementCount + (region.textContent?.length ?? 0)).toBe(
      0,
    );
  });

  it("shows the warning icon when an uploaded file has a warning", async () => {
    const { upload, calls } = deferredUpload();
    const page = await render(FileUploadInput, {
      upload,
      files: [file("a.txt")],
      validateFile: () => ({ level: "warning", message: "Check this." }),
    });
    await settle();
    calls[0].resolve();
    await settle();
    expect(
      page.container.querySelector(
        'svg[aria-label="a.txt uploaded with a warning"]',
      ),
    ).not.toBeNull();
  });

  it("marks a failed upload with an error and retries it", async () => {
    const { upload, calls } = deferredUpload();
    const onuploadstatuschange = vi.fn();
    const page = await render(FileUploadInput, {
      upload,
      files: [file("a.txt")],
      onuploadstatuschange,
    });
    await settle();
    expect(onuploadstatuschange).toHaveBeenLastCalledWith({
      uploading: 1,
      failed: 0,
    });

    calls[0].options.onProgress(0.3);
    calls[0].reject(new Error("Network down"));
    await settle();
    expect(onuploadstatuschange).toHaveBeenLastCalledWith({
      uploading: 0,
      failed: 1,
    });
    expect(page.container.querySelector("li")?.className).toBe(
      "file-item error",
    );
    expect(page.container.querySelector(".message-text")?.textContent).toBe(
      "File failed to upload.",
    );

    // Like a success, the status shows the progress reached and the result
    // icon for a moment, then clears; the message and the retry stay.
    const region = status(page.container);
    expect(region.textContent).toBe("30%");
    expect(
      region.querySelector('svg[aria-label="a.txt failed to upload"]'),
    ).not.toBeNull();
    vi.advanceTimersByTime(RESULT_DISPLAY_DURATION);
    flushSync();
    expect(region.childElementCount + (region.textContent?.length ?? 0)).toBe(
      0,
    );
    expect(page.container.querySelector(".message-text")?.textContent).toBe(
      "File failed to upload.",
    );

    const retry = button(page.container, "Retry upload of a.txt");
    expect(retry.getAttribute("aria-describedby")).toBe(
      page.container.querySelector(".file-message")?.id,
    );
    expect(retry.querySelector("use")?.getAttribute("href")).toBe(
      "/icons/change-version.svg#change-version",
    );
    retry.click();
    await settle();
    expect(upload).toHaveBeenCalledTimes(2);
    expect(region.textContent).toBe("0%");
    expect(button(page.container, "Retry upload of a.txt")).toBeNull();
  });

  it("passes the failure reason to the message", async () => {
    const { upload, calls } = deferredUpload();
    const page = await render(FileUploadInput, {
      upload,
      files: [file("a.txt")],
      messages: {
        uploadFailed: (failed, reason) =>
          `${failed.name}: ${(reason as Error).message}`,
      },
    });
    await settle();
    calls[0].reject(new Error("virus found"));
    await settle();
    expect(page.container.querySelector(".message-text")?.textContent).toBe(
      "a.txt: virus found",
    );
  });

  it("treats an upload function that throws as a failed upload", async () => {
    const upload = vi.fn(() => {
      throw new Error("bad");
    });
    const page = await render(FileUploadInput, {
      upload,
      files: [file("a.txt")],
    });
    await settle();
    expect(page.container.querySelector(".message-text")?.textContent).toBe(
      "File failed to upload.",
    );
  });

  it("cancels a running upload and removes the file in one click", async () => {
    const { upload, calls } = deferredUpload();
    const page = await render(Bound, {
      of: FileUploadInput,
      binding: "files",
      upload,
      multiple: true,
    });
    choose(page.container, [file("a.txt")]);
    await settle();

    button(page.container, "Cancel upload of a.txt").click();
    flushSync();
    expect(calls[0].options.signal.aborted).toBe(true);
    expect(readBound(page.container)).toEqual([]);
    expect(page.container.querySelector("li")).toBeNull();

    // The aborted upload's late settlement changes nothing.
    calls[0].reject(new DOMException("", "AbortError"));
    await settle();
    expect(page.container.querySelector("li")).toBeNull();
  });

  it("offers a retry only after a failed upload", async () => {
    const { upload, calls } = deferredUpload();
    const page = await render(FileUploadInput, {
      upload,
      multiple: true,
      files: [file("a.txt"), file("b.txt")],
    });
    await settle();
    const retries = () =>
      [
        ...page.container.querySelectorAll<HTMLButtonElement>(
          'button[aria-label^="Retry upload"]',
        ),
      ].map((retry) => retry.getAttribute("aria-label"));
    expect(retries()).toEqual([]);

    calls[0].resolve();
    await settle();
    expect(retries()).toEqual([]);

    calls[1].reject(new Error("no"));
    await settle();
    expect(retries()).toEqual(["Retry upload of b.txt"]);
  });

  it("aborts the upload of a file that leaves the files", async () => {
    const { upload, calls } = deferredUpload();
    const page = await render(FileUploadInput, {
      upload,
      files: [file("a.txt")],
    });
    await settle();
    await page.rerender({ files: [] });
    expect(calls[0].options.signal.aborted).toBe(true);
    // Late progress and a late success of the removed file are ignored.
    calls[0].options.onProgress(0.5);
    calls[0].resolve();
    await settle();
    expect(page.container.querySelector("li")).toBeNull();
  });

  it("stops being live when upload is removed", async () => {
    const { upload, calls } = deferredUpload();
    const chosen = file("a.txt");
    const page = await render(FileUploadInput, { upload, files: [chosen] });
    await settle();
    await page.rerender({ upload: undefined });
    expect(calls[0].options.signal.aborted).toBe(true);
    expect(status(page.container)).toBeNull();
  });

  it("does not upload a file with an error", async () => {
    const { upload } = deferredUpload();
    await render(FileUploadInput, {
      upload,
      maxSize: 1,
      files: [file("a.txt", 9)],
    });
    await settle();
    expect(upload).not.toHaveBeenCalled();
  });

  it("uploads each file once across renders", async () => {
    const { upload } = deferredUpload();
    const chosen = file("a.txt");
    const page = await render(FileUploadInput, { upload, files: [chosen] });
    await settle();
    await page.rerender({ files: [chosen], multiple: true });
    await settle();
    expect(upload).toHaveBeenCalledTimes(1);
  });

  it("aborts running uploads on unmount", async () => {
    const { upload, calls } = deferredUpload();
    const page = await render(FileUploadInput, {
      upload,
      files: [file("a.txt")],
    });
    await settle();
    page.unmount();
    expect(calls[0].options.signal.aborted).toBe(true);
  });

  it("clears a pending result timer when the file is removed", async () => {
    const { upload, calls } = deferredUpload();
    const chosen = file("a.txt");
    const page = await render(FileUploadInput, { upload, files: [chosen] });
    await settle();
    calls[0].resolve();
    await settle();
    await page.rerender({ files: [] });
    vi.advanceTimersByTime(RESULT_DISPLAY_DURATION);
    flushSync();
    expect(page.container.querySelector("li")).toBeNull();
  });
});
