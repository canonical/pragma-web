import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import FileUploadForm from "../../../testing/FileUploadForm.fixtures.svelte";
import OwnedForm from "../../../testing/OwnedForm.fixtures.svelte";
import type { UploadOptions } from "../../subcomponent/FileUploadInput/index.js";
import createFormState from "../../utils/owner/createFormState.svelte.js";
import { FileUploadField } from "./index.js";

const file = (name: string, size = 1): File => {
  const created = new File(["x"], name, { type: "text/plain" });
  Object.defineProperty(created, "size", { value: size });
  return created;
};

const deferredUpload = () => {
  const calls: {
    options: UploadOptions;
    resolve: () => void;
    reject: (reason: unknown) => void;
  }[] = [];
  const upload = vi.fn(
    (_file: File, options: UploadOptions) =>
      new Promise<void>((resolve, reject) => {
        calls.push({ options, resolve, reject });
      }),
  );
  return { upload, calls };
};

const submit = (container: HTMLElement) =>
  (container.querySelector("form") as HTMLFormElement).requestSubmit();
const alertOf = (container: HTMLElement) =>
  container.querySelector('[role="alert"]');
const chooseButton = (container: HTMLElement) =>
  container.querySelector(".drop-area > button") as HTMLButtonElement;
const nativeInput = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

describe("FileUploadField", () => {
  it("names the file input and points the label at it", async () => {
    const page = await render(FileUploadField, {
      name: "doc",
      label: "Upload",
    });
    const input = nativeInput(page.container);
    expect(input.name).toBe("doc");
    expect(input.required).toBe(true);
    expect(page.container.querySelector("label")?.htmlFor).toBe(input.id);
    await expect
      .element(page.getByRole("button", { name: /^Upload\*? Choose file$/ }))
      .toBeInTheDocument();
    const button = chooseButton(page.container);
    expect(button.hasAttribute("required")).toBe(false);
    expect(button.hasAttribute("aria-required")).toBe(false);
  });

  it("describes the button by the field description", async () => {
    const page = await render(FileUploadField, {
      name: "doc",
      label: "Upload",
      description: "PDF only, up to 2 MB.",
    });
    await expect
      .element(page.getByRole("button", { name: /^Upload\*? Choose file$/ }))
      .toHaveAccessibleDescription("PDF only, up to 2 MB.");
  });

  it("renders the required error under the drop area, links it and focuses the button", async () => {
    const onsubmit = vi.fn();
    const page = await render(FileUploadForm, {
      name: "doc",
      label: "Upload",
      onsubmit,
    });
    submit(page.container);
    await expect.poll(() => alertOf(page.container)).not.toBeNull();
    const alert = alertOf(page.container) as HTMLElement;
    expect(alert.textContent).toBe(
      nativeInput(page.container).validationMessage,
    );
    expect(alert.textContent).not.toBe("");
    expect(
      page.container.querySelector(".drop-area-group")?.contains(alert),
    ).toBe(true);
    expect(page.container.querySelectorAll(".ds.field-error")).toHaveLength(1);
    expect(
      page.container.querySelector(".ds.field")?.classList.contains("danger"),
    ).toBe(true);
    const button = chooseButton(page.container);
    expect(button.getAttribute("aria-invalid")).toBe("true");
    expect(button.getAttribute("aria-errormessage")).toBe(alert.id);
    expect(document.activeElement).toBe(button);
    // The drop area takes the error Criticality class; the button does not.
    expect(
      page.container.querySelector(".drop-area")?.classList.contains("error"),
    ).toBe(true);
    expect(button.classList.contains("error")).toBe(false);
    expect(onsubmit).not.toHaveBeenCalled();
  });

  it("passes showDropArea through, and focuses a file's action when it is off", async () => {
    const page = await render(FileUploadForm, {
      name: "docs",
      label: "Upload",
      multiple: true,
      showDropArea: false,
      validateFile: () => ({ level: "error", message: "Not allowed." }),
      value: [file("a.txt")],
    });
    expect(page.container.querySelector(".drop-area")).toBeNull();
    submit(page.container);
    await expect
      .poll(() => document.activeElement?.getAttribute("aria-label"))
      .toBe("Remove a.txt");
    // With the drop area off, the field error still shows, and describes the
    // focused action.
    await expect.poll(() => alertOf(page.container)).not.toBeNull();
    const alert = alertOf(page.container) as HTMLElement;
    expect(alert.textContent).toBe("Remove the files that have errors.");
    expect(
      document.activeElement?.getAttribute("aria-describedby")?.split(" "),
    ).toContain(alert.id);
  });

  it("hides the file list with showFileList off", async () => {
    const page = await render(FileUploadField, {
      name: "docs",
      label: "Upload",
      multiple: true,
      showFileList: false,
      value: [file("a.txt")],
    });
    expect(page.container.querySelector(".file-list")).toBeNull();
  });

  it("errors when more than maxFiles are selected", async () => {
    const onsubmit = vi.fn();
    const page = await render(FileUploadForm, {
      name: "docs",
      label: "Upload",
      multiple: true,
      maxFiles: 2,
      value: [file("a.txt"), file("b.txt"), file("c.txt")],
      onsubmit,
    });
    // The rule waits for a submit, as the browser's own validation does.
    expect(alertOf(page.container)).toBeNull();
    submit(page.container);
    await expect
      .poll(() => alertOf(page.container)?.textContent)
      .toBe("You can upload at most 2 files.");
    expect(onsubmit).not.toHaveBeenCalled();
    // Removing a file clears the message.
    (
      page.container.querySelector(
        'button[aria-label="Remove c.txt"]',
      ) as HTMLButtonElement
    ).click();
    await expect.poll(() => alertOf(page.container)).toBeNull();
  });

  it("is invalid while a file has an error, and shows that error on its tile", async () => {
    const page = await render(FileUploadForm, {
      name: "docs",
      label: "Upload",
      multiple: true,
      maxSize: 1024,
      value: [file("big.txt", 2048)],
    });
    expect(page.container.querySelector(".message-text")?.textContent).toBe(
      "File size exceeds 1 kB.",
    );
    submit(page.container);
    await expect
      .poll(() => alertOf(page.container)?.textContent)
      .toBe("Remove the files that have errors.");
  });

  it("stays valid with a file warning", async () => {
    const onsubmit = vi.fn();
    const page = await render(FileUploadForm, {
      name: "docs",
      label: "Upload",
      validateFile: () => ({ level: "warning", message: "Large file." }),
      value: [file("a.txt")],
      onsubmit,
    });
    expect(page.container.querySelector(".message-text")?.textContent).toBe(
      "Large file.",
    );
    submit(page.container);
    await expect.poll(() => onsubmit.mock.calls.length).toBe(1);
    expect(alertOf(page.container)).toBeNull();
  });

  it("does not error when within maxFiles and maxSize", async () => {
    const onsubmit = vi.fn();
    const page = await render(FileUploadForm, {
      name: "docs",
      label: "Upload",
      multiple: true,
      maxFiles: 2,
      maxSize: 1024,
      value: [file("ok.txt", 512)],
      onsubmit,
    });
    submit(page.container);
    await expect.poll(() => onsubmit.mock.calls.length).toBe(1);
    expect(alertOf(page.container)).toBeNull();
  });

  it("holds a submit back until uploads finish, then clears the error", async () => {
    const { upload, calls } = deferredUpload();
    const onuploadstatuschange = vi.fn();
    const onsubmit = vi.fn();
    const page = await render(FileUploadForm, {
      name: "docs",
      label: "Upload",
      multiple: true,
      upload,
      onuploadstatuschange,
      value: [file("a.txt")],
      onsubmit,
    });
    await expect.poll(() => upload.mock.calls.length).toBe(1);
    submit(page.container);
    await expect
      .poll(() => alertOf(page.container)?.textContent)
      .toBe("Wait for the uploads to finish.");
    expect(onsubmit).not.toHaveBeenCalled();

    calls[0].resolve();
    await expect.poll(() => alertOf(page.container)).toBeNull();
    expect(onuploadstatuschange).toHaveBeenLastCalledWith({
      uploading: 0,
      failed: 0,
    });
    submit(page.container);
    await expect.poll(() => onsubmit.mock.calls.length).toBe(1);
  });

  it("is invalid while an upload has failed", async () => {
    const { upload, calls } = deferredUpload();
    const page = await render(FileUploadForm, {
      name: "docs",
      label: "Upload",
      multiple: true,
      upload,
      value: [file("a.txt")],
    });
    await expect.poll(() => upload.mock.calls.length).toBe(1);
    calls[0].reject(new Error("offline"));
    await expect
      .poll(() => page.container.querySelector(".message-text")?.textContent)
      .toBe("File failed to upload.");
    submit(page.container);
    await expect
      .poll(() => alertOf(page.container)?.textContent)
      .toBe("Retry or remove the files that failed to upload.");
  });

  it("focuses a file's action when the single-file drop area is hidden", async () => {
    const page = await render(FileUploadForm, {
      name: "doc",
      label: "Upload",
      validateFile: () => ({ level: "error", message: "Not allowed." }),
      value: [file("a.txt")],
    });
    submit(page.container);
    await expect
      .poll(() => document.activeElement?.getAttribute("aria-label"))
      .toBe("Remove a.txt");
    // The drop area is hidden in single-file mode while a file is chosen; the
    // field error still shows, and the tile carries its own message.
    await expect
      .poll(() => alertOf(page.container)?.textContent)
      .toBe("Remove the files that have errors.");
    expect(page.container.querySelector(".message-text")?.textContent).toBe(
      "Not allowed.",
    );
  });

  it("stops the submit of a form that skips native validation", async () => {
    const onsubmit = vi.fn();
    const page = await render(FileUploadForm, {
      name: "docs",
      label: "Upload",
      multiple: true,
      maxFiles: 1,
      novalidate: true,
      value: [file("a.txt"), file("b.txt")],
      onsubmit,
    });
    submit(page.container);
    await expect
      .poll(() => alertOf(page.container)?.textContent)
      .toBe("You can upload at most 1 file.");
    expect(onsubmit).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(chooseButton(page.container));

    // A valid selection, or a submit from another form, goes through.
    (
      page.container.querySelector(
        'button[aria-label="Remove b.txt"]',
      ) as HTMLButtonElement
    ).click();
    await expect.poll(() => alertOf(page.container)).toBeNull();
    submit(page.container);
    await expect.poll(() => onsubmit.mock.calls.length).toBe(1);
  });

  it("shows an owner's error under the drop area and reports leaving the field", async () => {
    const owner = createFormState({
      validate: (values) => ({
        upload: values.upload ? undefined : "Choose a file to upload.",
      }),
    });
    const blur = vi.spyOn(owner, "blur");
    const page = await render(OwnedForm, {
      owner,
      fields: [{ inputType: "file", name: "upload", label: "Upload" }],
    });
    const form = page.container.querySelector("form") as HTMLFormElement;
    form.noValidate = true;
    form.requestSubmit();
    await expect
      .poll(() => alertOf(page.container)?.textContent)
      .toBe("Choose a file to upload.");
    const button = chooseButton(page.container);
    expect(
      page.container
        .querySelector(".drop-area-group")
        ?.contains(alertOf(page.container)),
    ).toBe(true);
    await expect.poll(() => document.activeElement).toBe(button);
    button.blur();
    expect(blur).toHaveBeenCalledWith("upload");
  });
});
