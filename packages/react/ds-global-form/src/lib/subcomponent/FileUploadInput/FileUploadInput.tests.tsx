import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RESULT_DISPLAY_DURATION } from "./constants.js";
import { FileUploadInput } from "./FileUploadInput.js";
import type { FileUploadInputProps, UploadOptions } from "./types.js";

const file = (name: string, size = 1, type = "text/plain"): File => {
  const created = new File(["x"], name, { type });
  // jsdom's File does not take its size from a fixed length; pin it.
  Object.defineProperty(created, "size", { value: size });
  return created;
};

const chooseButton = () => screen.getByRole("button", { name: /Choose file/ });
const nativeInput = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

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

/** Keeps the value in state, as a consumer would. */
const Controlled = ({
  initial = [],
  ...props
}: Omit<FileUploadInputProps, "value"> & { initial?: File[] }) => {
  const [value, setValue] = useState<File[]>(initial);
  return (
    <FileUploadInput
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onChange?.(next);
      }}
    />
  );
};

describe("FileUploadInput (presentational)", () => {
  it("renders the drop area and the Choose file button without a form", () => {
    render(<FileUploadInput />);
    expect(screen.getByText("Drag and drop or")).toBeInTheDocument();
    expect(chooseButton()).toHaveAttribute("type", "button");
    expect(chooseButton()).toHaveClass("ds", "button", "secondary");
  });

  it("names the button for several files when multiple", () => {
    render(<FileUploadInput multiple />);
    expect(
      screen.getByRole("button", { name: "Choose files" }),
    ).toBeInTheDocument();
  });

  it("puts the root classes and other props on the root element", () => {
    const { container } = render(
      <FileUploadInput className="extra" data-testid="root" />,
    );
    const root = screen.getByTestId("root");
    expect(root).toBe(container.firstChild);
    expect(root).toHaveClass("ds", "input", "file-upload", "extra");
  });

  it("renders a hidden native file input with the accept list", () => {
    const { container } = render(<FileUploadInput accept="image/*" multiple />);
    const input = nativeInput(container);
    expect(input).toHaveAttribute("accept", "image/*");
    expect(input).toHaveAttribute("multiple");
    expect(input).toHaveAttribute("aria-hidden", "true");
    expect(input).toHaveAttribute("tabindex", "-1");
  });

  it("keeps the native input outside the drop area, as a child of the root", () => {
    const { container } = render(<FileUploadInput />);
    const input = nativeInput(container);
    expect(container.querySelector(".drop-area")).not.toContainElement(input);
    expect(input.parentElement).toHaveClass("file-upload");
  });

  it("puts the id, name and required on the native input, not the button", () => {
    const { container } = render(
      <>
        <label htmlFor="docs">Documents</label>
        <FileUploadInput id="docs" name="docs" required />
      </>,
    );
    const input = nativeInput(container);
    expect(input).toHaveAttribute("id", "docs");
    expect(input).toHaveAttribute("name", "docs");
    expect(input).toBeRequired();
    expect(chooseButton()).not.toHaveAttribute("required");
    expect(chooseButton()).not.toHaveAttribute("name");
    expect(input.parentElement).not.toHaveAttribute("id");
  });

  it("names the button by the field label and its own text", () => {
    render(
      <>
        <span id="label">Upload image</span>
        <FileUploadInput
          aria-labelledby="label"
          aria-describedby="hint"
          aria-invalid
          aria-errormessage="problem"
        />
      </>,
    );
    const button = screen.getByRole("button", {
      name: "Upload image Choose file",
    });
    expect(button).toHaveAttribute("aria-describedby", "hint");
    expect(button).toHaveAttribute("aria-invalid", "true");
    expect(button).toHaveAttribute("aria-errormessage", "problem");
  });

  it("opens the file picker from the button", () => {
    const { container } = render(<FileUploadInput />);
    const click = vi.spyOn(nativeInput(container), "click");
    fireEvent.click(chooseButton());
    expect(click).toHaveBeenCalledTimes(1);
  });

  it("calls onChange with the chosen files and clears the native value", () => {
    const onChange = vi.fn();
    const { container } = render(<FileUploadInput onChange={onChange} />);
    const chosen = file("hello.txt");
    const input = nativeInput(container);

    fireEvent.change(input, { target: { files: [chosen] } });

    expect(onChange).toHaveBeenCalledWith([chosen]);
    expect(input.value).toBe("");
  });

  it("keeps only the first file in single-file mode", () => {
    const onChange = vi.fn();
    const { container } = render(<FileUploadInput onChange={onChange} />);
    const [first, second] = [file("a.txt"), file("b.txt")];
    fireEvent.change(nativeInput(container), {
      target: { files: [first, second] },
    });
    expect(onChange).toHaveBeenCalledWith([first]);
  });

  it("adds to the chosen files when multiple", () => {
    const onChange = vi.fn();
    const existing = file("a.txt");
    const { container } = render(
      <FileUploadInput multiple value={[existing]} onChange={onChange} />,
    );
    const added = file("b.txt");
    fireEvent.change(nativeInput(container), { target: { files: [added] } });
    expect(onChange).toHaveBeenCalledWith([existing, added]);
  });

  it("ignores a change with no files, and works without onChange", () => {
    const onChange = vi.fn();
    const { container, rerender } = render(
      <FileUploadInput onChange={onChange} />,
    );
    fireEvent.change(nativeInput(container), { target: { files: [] } });
    expect(onChange).not.toHaveBeenCalled();

    rerender(<FileUploadInput />);
    fireEvent.change(nativeInput(container), {
      target: { files: [file("a.txt")] },
    });
  });

  describe("drag and drop", () => {
    const dropArea = (container: HTMLElement) =>
      container.querySelector(".drop-area") as HTMLElement;

    it("shows the drag-over state while a file is over the area", () => {
      const { container } = render(<FileUploadInput />);
      const area = dropArea(container);
      fireEvent.dragOver(area);
      expect(area).toHaveClass("drag-over");

      // Moving onto the button inside the area does not leave it.
      // jsdom has no DragEvent, so the leave is a mouse event of that type.
      const leave = (relatedTarget: Element) =>
        fireEvent(
          area,
          new MouseEvent("dragleave", { bubbles: true, relatedTarget }),
        );

      // Moving onto the button inside the area does not leave it.
      leave(chooseButton());
      expect(area).toHaveClass("drag-over");

      leave(document.body);
      expect(area).not.toHaveClass("drag-over");
    });

    it("adds dropped files", () => {
      const onChange = vi.fn();
      const { container } = render(<FileUploadInput onChange={onChange} />);
      const dropped = file("dropped.txt");
      fireEvent.dragOver(dropArea(container));
      fireEvent.drop(dropArea(container), {
        dataTransfer: { files: [dropped] },
      });
      expect(onChange).toHaveBeenCalledWith([dropped]);
      expect(dropArea(container)).not.toHaveClass("drag-over");
    });

    it("ignores a drop with no files", () => {
      const onChange = vi.fn();
      const { container } = render(<FileUploadInput onChange={onChange} />);
      fireEvent.drop(dropArea(container), { dataTransfer: { files: [] } });
      expect(onChange).not.toHaveBeenCalled();
    });

    it("ignores dragging and dropping while disabled", () => {
      const onChange = vi.fn();
      const { container } = render(
        <FileUploadInput disabled onChange={onChange} />,
      );
      fireEvent.dragOver(dropArea(container));
      expect(dropArea(container)).not.toHaveClass("drag-over");
      fireEvent.drop(dropArea(container), {
        dataTransfer: { files: [file("a.txt")] },
      });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("the file list", () => {
    it("shows each file's name, with the full name as a tooltip, and size", () => {
      render(
        <FileUploadInput
          multiple
          value={[file("report.pdf", 1536), file("tiny.txt", 12)]}
        />,
      );
      expect(screen.getByText("report.pdf")).toHaveAttribute(
        "title",
        "report.pdf",
      );
      expect(screen.getByText("1.5 kB")).toBeInTheDocument();
      expect(screen.getByText("12 byte")).toBeInTheDocument();
    });

    it("hides the size when showFileSize is off", () => {
      const { container } = render(
        <FileUploadInput value={[file("a.txt", 2048)]} showFileSize={false} />,
      );
      expect(container.querySelector(".file-size")).not.toBeInTheDocument();
    });

    it("renders the size with the messages' format", () => {
      render(
        <FileUploadInput
          value={[file("a.txt", 2048)]}
          messages={{ fileSize: (bytes) => `${bytes} octets` }}
        />,
      );
      expect(screen.getByText("2048 octets")).toBeInTheDocument();
    });

    it("removes a file with its remove button", () => {
      const onChange = vi.fn();
      const [kept, removed] = [file("kept.txt"), file("removed.txt")];
      render(
        <FileUploadInput
          multiple
          value={[kept, removed]}
          onChange={onChange}
        />,
      );
      fireEvent.click(
        screen.getByRole("button", { name: "Remove removed.txt" }),
      );
      expect(onChange).toHaveBeenCalledWith([kept]);
    });

    it("gives two files with the same name their own tiles", () => {
      render(
        <FileUploadInput multiple value={[file("a.txt"), file("a.txt")]} />,
      );
      expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });

    it("draws no list when disabled", () => {
      const { container } = render(
        <FileUploadInput disabled multiple value={[file("a.txt")]} />,
      );
      expect(container.querySelector(".file-list")).not.toBeInTheDocument();
      expect(container.firstChild).toHaveClass("disabled");
      expect(chooseButton()).toBeDisabled();
      expect(nativeInput(container)).toBeDisabled();
    });

    it("draws no status for a file that is not uploaded live", () => {
      const { container } = render(<FileUploadInput value={[file("a.txt")]} />);
      expect(container.querySelector(".file-status")).not.toBeInTheDocument();
    });
  });

  describe("image thumbnails", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it("previews an image from an object URL and revokes it on removal", () => {
      const createObjectURL = vi.fn(() => "blob:preview");
      const revokeObjectURL = vi.fn();
      vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
      const image = file("photo.png", 10, "image/png");

      const { container, rerender } = render(
        <FileUploadInput value={[image]} />,
      );
      const preview = container.querySelector(".thumbnail > img");
      expect(preview).toHaveAttribute("src", "blob:preview");
      expect(preview).toHaveAttribute("alt", "");
      expect(createObjectURL).toHaveBeenCalledWith(image);

      rerender(<FileUploadInput value={[]} />);
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:preview");
    });

    it("keeps the thumbnail box empty where object URLs are unsupported", () => {
      vi.stubGlobal("URL", { ...URL, createObjectURL: undefined });
      const { container } = render(
        <FileUploadInput value={[file("photo.png", 10, "image/png")]} />,
      );
      expect(container.querySelector(".thumbnail")).toBeEmptyDOMElement();
    });

    it("draws no thumbnail for a file that is not an image", () => {
      const { container } = render(<FileUploadInput value={[file("a.txt")]} />);
      expect(container.querySelector(".thumbnail")).not.toBeInTheDocument();
    });
  });

  describe("per-file messages", () => {
    it("errors on a file that accept does not allow, and links the message", () => {
      render(<FileUploadInput accept=".pdf" value={[file("notes.txt")]} />);
      const message = screen.getByText("File type is not accepted.");
      const tile = screen.getByRole("listitem");
      const paragraph = message.closest("p") as HTMLElement;
      expect(tile).toHaveClass("file-item", "error");
      expect(tile).toHaveAttribute("aria-describedby", paragraph.id);
      expect(
        screen.getByRole("button", { name: "Remove notes.txt" }),
      ).toHaveAccessibleDescription(/File type is not accepted\./);
      expect(within(paragraph).getByRole("img", { name: "Error:" })).toBe(
        paragraph.querySelector("svg"),
      );
    });

    it("errors on a file larger than maxSize", () => {
      render(
        <FileUploadInput maxSize={1024} value={[file("big.txt", 4096)]} />,
      );
      expect(screen.getByText("File size exceeds 1 kB.")).toBeInTheDocument();
    });

    it("shows a validateFile warning", () => {
      const validateFile = vi.fn(() => ({
        level: "warning" as const,
        message: "This file is large.",
      }));
      render(
        <FileUploadInput value={[file("a.txt")]} validateFile={validateFile} />,
      );
      expect(screen.getByRole("listitem")).toHaveClass("warning");
      expect(screen.getByRole("img", { name: "Warning:" })).toBeInTheDocument();
      expect(screen.getByText("This file is large.")).toBeInTheDocument();
    });

    it("renders no message for a valid file", () => {
      const { container } = render(
        <FileUploadInput
          accept="text/*"
          maxSize={10}
          validateFile={() => undefined}
          value={[file("a.txt", 5)]}
        />,
      );
      expect(container.querySelector(".file-message")).not.toBeInTheDocument();
      expect(screen.getByRole("listitem")).not.toHaveAttribute(
        "aria-describedby",
      );
    });
  });

  describe("the drop area in single-file mode", () => {
    it("hides once a file is chosen and returns when it is removed", () => {
      const { container } = render(<Controlled />);
      fireEvent.change(nativeInput(container), {
        target: { files: [file("a.txt")] },
      });
      expect(container.querySelector(".drop-area")).not.toBeInTheDocument();
      // The native input stays, so the file still posts.
      expect(nativeInput(container)).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Remove a.txt" }));
      expect(container.querySelector(".drop-area")).toBeInTheDocument();
    });

    it("stays when multiple", () => {
      const { container } = render(
        <FileUploadInput multiple value={[file("a.txt")]} />,
      );
      expect(container.querySelector(".drop-area")).toBeInTheDocument();
    });
  });

  it("renders the field-level error under the drop area", () => {
    const { container } = render(
      <FileUploadInput
        error={<p className="field-error">Too many files.</p>}
      />,
    );
    expect(
      container.querySelector(".drop-area-group > .field-error"),
    ).toHaveTextContent("Too many files.");
  });

  describe("mirroring the value into the file input", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it("sets the native input's files to the controlled value", () => {
      class FakeDataTransfer {
        readonly files: File[] = [];
        readonly items = { add: (added: File) => this.files.push(added) };
      }
      vi.stubGlobal("DataTransfer", FakeDataTransfer);
      const setFiles = vi
        .spyOn(HTMLInputElement.prototype, "files", "set")
        .mockImplementation(() => {});
      const chosen = file("report.pdf");

      render(<FileUploadInput name="docs" value={[chosen]} />);

      expect(setFiles).toHaveBeenLastCalledWith([chosen]);
    });

    it("leaves the native input alone where DataTransfer is unavailable", () => {
      vi.stubGlobal("DataTransfer", undefined);
      const setFiles = vi.spyOn(HTMLInputElement.prototype, "files", "set");

      render(<FileUploadInput name="docs" value={[]} />);

      expect(setFiles).not.toHaveBeenCalled();
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

  const settle = () => act(async () => {});

  it("uploads each chosen file with a signal and shows its progress", async () => {
    const { upload, calls } = deferredUpload();
    const chosen = file("a.txt");
    const { container } = render(
      <FileUploadInput upload={upload} value={[chosen]} />,
    );
    await settle();

    expect(upload).toHaveBeenCalledWith(chosen, expect.any(Object));
    expect(calls[0].options.signal.aborted).toBe(false);
    const status = container.querySelector(".file-status") as HTMLElement;
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("0%");
    expect(
      within(status).getByRole("img", { name: "Uploading a.txt" }),
    ).toHaveClass("spinner");
    expect(
      screen.getByRole("button", { name: "Cancel upload of a.txt" }),
    ).toBeInTheDocument();

    act(() => calls[0].options.onProgress(0.456));
    expect(status).toHaveTextContent("46%");
    // A report within the same whole percent changes nothing.
    act(() => calls[0].options.onProgress(0.4561));
    expect(status).toHaveTextContent("46%");
    act(() => calls[0].options.onProgress(4));
    expect(status).toHaveTextContent("100%");
    act(() => calls[0].options.onProgress(Number.NaN));
    expect(status).toHaveTextContent("0%");
  });

  it("shows the success icon briefly once the upload ends", async () => {
    const { upload, calls } = deferredUpload();
    const { container } = render(
      <FileUploadInput upload={upload} value={[file("a.txt")]} />,
    );
    await settle();
    await act(async () => calls[0].resolve());

    const status = container.querySelector(".file-status") as HTMLElement;
    expect(status).toHaveTextContent("100%");
    expect(
      within(status).getByRole("img", { name: "a.txt uploaded" }),
    ).toHaveClass("status-success");
    expect(
      screen.getByRole("button", { name: "Remove a.txt" }),
    ).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(RESULT_DISPLAY_DURATION));
    expect(status).toBeEmptyDOMElement();
  });

  it("shows the warning icon when an uploaded file has a warning", async () => {
    const { upload, calls } = deferredUpload();
    render(
      <FileUploadInput
        upload={upload}
        value={[file("a.txt")]}
        validateFile={() => ({ level: "warning", message: "Check this." })}
      />,
    );
    await settle();
    await act(async () => calls[0].resolve());
    expect(
      screen.getByRole("img", { name: "a.txt uploaded with a warning" }),
    ).toHaveClass("status-warning");
  });

  it("marks a failed upload with an error and retries it", async () => {
    const { upload, calls } = deferredUpload();
    const onUploadStatusChange = vi.fn();
    render(
      <FileUploadInput
        upload={upload}
        value={[file("a.txt")]}
        onUploadStatusChange={onUploadStatusChange}
      />,
    );
    await settle();
    expect(onUploadStatusChange).toHaveBeenLastCalledWith({
      uploading: 1,
      failed: 0,
    });

    await act(async () => calls[0].reject(new Error("Network down")));
    expect(onUploadStatusChange).toHaveBeenLastCalledWith({
      uploading: 0,
      failed: 1,
    });
    expect(screen.getByRole("listitem")).toHaveClass("error");
    expect(screen.getByText("File failed to upload.")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "a.txt failed to upload" }),
    ).toHaveClass("status-error");

    const retry = screen.getByRole("button", { name: "Retry upload of a.txt" });
    expect(retry).toHaveAccessibleDescription(/File failed to upload\./);
    fireEvent.click(retry);
    await settle();
    expect(upload).toHaveBeenCalledTimes(2);
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Retry upload of a.txt" }),
    ).not.toBeInTheDocument();
  });

  it("passes the failure reason to the message", async () => {
    const { upload, calls } = deferredUpload();
    render(
      <FileUploadInput
        upload={upload}
        value={[file("a.txt")]}
        messages={{
          uploadFailed: (failed, reason) =>
            `${failed.name}: ${(reason as Error).message}`,
        }}
      />,
    );
    await settle();
    await act(async () => calls[0].reject(new Error("virus found")));
    expect(screen.getByText("a.txt: virus found")).toBeInTheDocument();
  });

  it("treats an upload function that throws as a failed upload", async () => {
    const upload = vi.fn(() => {
      throw new Error("bad");
    });
    render(<FileUploadInput upload={upload} value={[file("a.txt")]} />);
    await settle();
    expect(screen.getByText("File failed to upload.")).toBeInTheDocument();
  });

  it("cancels a running upload, then removes the file", async () => {
    const { upload, calls } = deferredUpload();
    const onChange = vi.fn();
    const chosen = file("a.txt");
    render(
      <FileUploadInput upload={upload} value={[chosen]} onChange={onChange} />,
    );
    await settle();

    fireEvent.click(
      screen.getByRole("button", { name: "Cancel upload of a.txt" }),
    );
    expect(calls[0].options.signal.aborted).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText("Upload cancelled.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Retry upload of a.txt" }),
    ).toBeInTheDocument();

    // The aborted upload's late settlement and progress change nothing.
    act(() => calls[0].options.onProgress(0.5));
    await act(async () => calls[0].reject(new DOMException("", "AbortError")));
    expect(screen.getByText("Upload cancelled.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove a.txt" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("aborts the upload of a file that leaves the value", async () => {
    const { upload, calls } = deferredUpload();
    const { rerender } = render(
      <FileUploadInput upload={upload} value={[file("a.txt")]} />,
    );
    await settle();
    rerender(<FileUploadInput upload={upload} value={[]} />);
    expect(calls[0].options.signal.aborted).toBe(true);
    // A late success of the removed file is ignored.
    await act(async () => calls[0].resolve());
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("stops being live when upload is removed", async () => {
    const { upload, calls } = deferredUpload();
    const chosen = file("a.txt");
    const { container, rerender } = render(
      <FileUploadInput upload={upload} value={[chosen]} />,
    );
    await settle();
    rerender(<FileUploadInput value={[chosen]} />);
    expect(calls[0].options.signal.aborted).toBe(true);
    expect(container.querySelector(".file-status")).not.toBeInTheDocument();
  });

  it("does not upload a file with an error", async () => {
    const { upload } = deferredUpload();
    render(
      <FileUploadInput
        upload={upload}
        maxSize={1}
        value={[file("a.txt", 9)]}
      />,
    );
    await settle();
    expect(upload).not.toHaveBeenCalled();
  });

  it("uploads each file once across renders", async () => {
    const { upload } = deferredUpload();
    const chosen = file("a.txt");
    const { rerender } = render(
      <FileUploadInput upload={upload} value={[chosen]} />,
    );
    await settle();
    rerender(<FileUploadInput upload={upload} value={[chosen]} multiple />);
    await settle();
    expect(upload).toHaveBeenCalledTimes(1);
  });

  it("aborts running uploads on unmount", async () => {
    const { upload, calls } = deferredUpload();
    const { unmount } = render(
      <FileUploadInput upload={upload} value={[file("a.txt")]} />,
    );
    await settle();
    unmount();
    expect(calls[0].options.signal.aborted).toBe(true);
  });

  it("clears a pending result timer when the file is removed", async () => {
    const { upload, calls } = deferredUpload();
    const chosen = file("a.txt");
    const { rerender } = render(
      <FileUploadInput upload={upload} value={[chosen]} />,
    );
    await settle();
    await act(async () => calls[0].resolve());
    rerender(<FileUploadInput upload={upload} value={[]} />);
    act(() => vi.advanceTimersByTime(RESULT_DISPLAY_DURATION));
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});
