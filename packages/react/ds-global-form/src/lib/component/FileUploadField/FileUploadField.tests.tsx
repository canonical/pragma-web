import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithForm } from "../../../testing/renderWithForm.js";
import type { UploadOptions } from "../../subcomponent/FileUploadInput/index.js";
import fileUploadRules from "./fileUploadRules.js";
import { FileUploadField } from "./index.js";

const file = (name: string, sizeBytes = 1): File => {
  const f = new File(["x"], name, { type: "text/plain" });
  // jsdom's File may not honour content length for `size`; pin it explicitly.
  Object.defineProperty(f, "size", { value: sizeBytes });
  return f;
};

// Submitting is what runs RHF's `validate` rules; seed the value via
// defaultValues and fire a submit on the wrapping form.
const submit = () => {
  const form = document.querySelector("form");
  if (form) fireEvent.submit(form);
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

describe("FileUploadField", () => {
  it("names the file input and points the label at it", () => {
    const { container } = renderWithForm(
      <FileUploadField name="doc" label="Upload" />,
    );
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toHaveAttribute("name", "doc");
    expect(fileInput).toBeRequired();
    expect(screen.getByText("Upload").closest("label")).toHaveAttribute(
      "for",
      fileInput?.id,
    );
    const button = screen.getByRole("button", { name: "Upload Choose file" });
    expect(button).not.toHaveAttribute("required");
    expect(button).not.toHaveAttribute("aria-required");
  });

  it("describes the button by the field description", () => {
    renderWithForm(
      <FileUploadField
        name="doc"
        label="Upload"
        description="PDF only, up to 2 MB."
      />,
    );
    expect(
      screen.getByRole("button", { name: "Upload Choose file" }),
    ).toHaveAccessibleDescription("PDF only, up to 2 MB.");
  });

  it("renders the required error under the drop area and links it", async () => {
    const { container } = renderWithForm(
      <FileUploadField name="doc" label="Upload" />,
    );
    submit();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Upload is required");
    expect(container.querySelector(".drop-area-group")).toContainElement(alert);
    expect(container.querySelectorAll(".ds.field-error")).toHaveLength(1);
    expect(container.querySelector(".ds.field")).toHaveClass("danger");
    const button = screen.getByRole("button", { name: "Upload Choose file" });
    expect(button).toHaveAttribute("aria-invalid", "true");
    expect(button).toHaveAttribute("aria-errormessage", alert.id);
    // The field's ref focuses the Choose file button.
    expect(button).toHaveFocus();
    // The drop area takes the error Criticality class; the button does not.
    expect(container.querySelector(".drop-area")).toHaveClass("error");
    expect(button).not.toHaveClass("error");
  });

  it("passes showDropArea and showFileList through to the input", async () => {
    const { container } = renderWithForm(
      <FileUploadField
        name="docs"
        label="Upload"
        multiple
        showDropArea={false}
        validateFile={() => ({ level: "error", message: "Not allowed." })}
      />,
      { formProps: { defaultValues: { docs: [file("a.txt")] } } },
    );
    expect(container.querySelector(".drop-area")).toBeNull();
    submit();
    // With the drop area off, the field error still shows, the ref focuses
    // the tile's action, and the action is described by the error.
    const remove = screen.getByRole("button", { name: "Remove a.txt" });
    await waitFor(() => {
      expect(remove).toHaveFocus();
    });
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Remove the files that have errors.");
    expect(remove.getAttribute("aria-describedby")?.split(" ")).toContain(
      alert.id,
    );
  });

  it("hides the file list with showFileList off", () => {
    const { container } = renderWithForm(
      <FileUploadField
        name="docs"
        label="Upload"
        multiple
        showFileList={false}
      />,
      { formProps: { defaultValues: { docs: [file("a.txt")] } } },
    );
    expect(container.querySelector(".file-list")).toBeNull();
  });

  it("errors when more than maxFiles are selected", async () => {
    renderWithForm(
      <FileUploadField name="docs" label="Upload" multiple maxFiles={2} />,
      {
        formProps: {
          defaultValues: {
            docs: [file("a.txt"), file("b.txt"), file("c.txt")],
          },
        },
      },
    );
    submit();
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "You can upload at most 2 files.",
      );
    });
  });

  it("is invalid while a file has an error, and shows that error on its tile", async () => {
    renderWithForm(
      <FileUploadField name="docs" label="Upload" multiple maxSize={1024} />,
      { formProps: { defaultValues: { docs: [file("big.txt", 2048)] } } },
    );
    expect(screen.getByText("File size exceeds 1 kB.")).toBeInTheDocument();
    submit();
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Remove the files that have errors.",
      );
    });
  });

  it("stays valid with a file warning", async () => {
    renderWithForm(
      <FileUploadField
        name="docs"
        label="Upload"
        validateFile={() => ({ level: "warning", message: "Large file." })}
      />,
      { formProps: { defaultValues: { docs: [file("a.txt")] } } },
    );
    expect(screen.getByText("Large file.")).toBeInTheDocument();
    submit();
    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  it("does not error when within maxFiles and maxSize", async () => {
    renderWithForm(
      <FileUploadField
        name="docs"
        label="Upload"
        multiple
        maxFiles={2}
        maxSize={1024}
      />,
      { formProps: { defaultValues: { docs: [file("ok.txt", 512)] } } },
    );
    submit();
    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  it("holds a submit back until uploads finish, then clears the error", async () => {
    const { upload, calls } = deferredUpload();
    const onUploadStatusChange = vi.fn();
    renderWithForm(
      <FileUploadField
        name="docs"
        label="Upload"
        multiple
        upload={upload}
        onUploadStatusChange={onUploadStatusChange}
      />,
      { formProps: { defaultValues: { docs: [file("a.txt")] } } },
    );
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Wait for the uploads to finish.",
    );

    await act(async () => calls[0].resolve());
    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
    expect(onUploadStatusChange).toHaveBeenLastCalledWith({
      uploading: 0,
      failed: 0,
    });
  });

  it("is invalid while an upload has failed", async () => {
    const { upload, calls } = deferredUpload();
    renderWithForm(
      <FileUploadField name="docs" label="Upload" multiple upload={upload} />,
      { formProps: { defaultValues: { docs: [file("a.txt")] } } },
    );
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    await act(async () => calls[0].reject(new Error("offline")));
    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Retry or remove the files that failed to upload.",
    );
  });

  it("focuses a file's action when the drop area is hidden", async () => {
    renderWithForm(
      <FileUploadField
        name="doc"
        label="Upload"
        validateFile={() => ({ level: "error", message: "Not allowed." })}
      />,
      { formProps: { defaultValues: { doc: [file("a.txt")] } } },
    );
    submit();
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Remove a.txt" }),
      ).toHaveFocus();
    });
    // The drop area is hidden in single-file mode while a file is chosen; the
    // field error still shows, and the tile carries its own message.
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Remove the files that have errors.",
    );
    expect(screen.getByText("Not allowed.")).toBeInTheDocument();
  });

  it("runs a consumer validate function after its own rules", async () => {
    renderWithForm(
      <FileUploadField
        name="docs"
        label="Upload"
        multiple
        registerProps={{ validate: () => "Custom problem." }}
      />,
      { formProps: { defaultValues: { docs: [file("a.txt")] } } },
    );
    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Custom problem.",
    );
  });
});

describe("fileUploadRules", () => {
  const messages = {
    tooManyFiles: () => "too many",
    filesHaveErrors: () => "file errors",
    uploadsPending: () => "pending",
    uploadsFailed: () => "failed",
    fileSize: String,
    fileTooLarge: () => "too large",
    fileTypeNotAccepted: () => "not accepted",
  } as unknown as Parameters<typeof fileUploadRules>[1];
  const idle = () => ({ uploading: 0, failed: 0 });

  const run = (
    rules: ReturnType<typeof fileUploadRules>,
    value: unknown,
  ): Record<string, unknown> =>
    Object.fromEntries(
      Object.entries(
        rules.validate as Record<string, (v: unknown) => unknown>,
      ).map(([key, validate]) => [key, validate(value)]),
    );

  it("passes a valid selection, and treats a non-array value as empty", () => {
    expect(run(fileUploadRules({}, messages, idle), undefined)).toEqual({
      maxFiles: true,
      files: true,
      uploads: true,
    });
  });

  it("reports each rule's message", () => {
    const rules = fileUploadRules(
      { maxFiles: 0, maxSize: 0 },
      messages,
      () => ({
        uploading: 1,
        failed: 0,
      }),
    );
    expect(run(rules, [file("a.txt", 5)])).toEqual({
      maxFiles: "too many",
      files: "file errors",
      uploads: "pending",
    });
    expect(
      run(
        fileUploadRules({}, messages, () => ({ uploading: 0, failed: 2 })),
        [],
      ),
    ).toMatchObject({ uploads: "failed" });
  });

  it("keeps consumer rules and adds a consumer validate", () => {
    const custom = vi.fn(() => true);
    const withFunction = fileUploadRules({}, messages, idle, {
      required: true,
      validate: custom,
    });
    expect(withFunction.required).toBe(true);
    expect(Object.keys(withFunction.validate as object)).toEqual([
      "maxFiles",
      "files",
      "uploads",
      "custom",
    ]);

    const withObject = fileUploadRules({}, messages, idle, {
      validate: { notEmpty: custom },
    });
    expect(Object.keys(withObject.validate as object)).toContain("notEmpty");
  });
});
