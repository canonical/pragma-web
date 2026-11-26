import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FileUploadInput } from "./FileUploadInput.js";

// These tests render the presentational input with NO FormProvider, proving it
// is usable standalone (outside of a <Form>).
describe("FileUploadInput (presentational)", () => {
  it("renders the dropzone without a form context", () => {
    render(<FileUploadInput />);
    expect(
      screen.getByText("Drop files here or click to browse"),
    ).toBeInTheDocument();
  });

  it("applies the input chrome on the wrapping element", () => {
    const { container } = render(<FileUploadInput />);
    expect(
      container.querySelector(".ds.input.file-upload"),
    ).toBeInTheDocument();
  });

  it("renders a hidden file input", () => {
    const { container } = render(<FileUploadInput accept="image/*" multiple />);
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute("accept", "image/*");
    expect(fileInput).toHaveAttribute("multiple");
  });

  it("calls onChange with a File[] when a file is selected", () => {
    const onChange = vi.fn();
    const { container } = render(<FileUploadInput onChange={onChange} />);
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["hello"], "hello.txt", { type: "text/plain" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const emitted = onChange.mock.calls[0][0];
    expect(Array.isArray(emitted)).toBe(true);
    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toBeInstanceOf(File);
    expect(emitted[0].name).toBe("hello.txt");
  });

  it("renders the provided files in the list", () => {
    const file = new File(["hello"], "report.pdf", {
      type: "application/pdf",
    });
    render(<FileUploadInput value={[file]} />);
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove report.pdf" }),
    ).toBeInTheDocument();
  });

  it("keeps the file input outside the drop-zone button", () => {
    const { container } = render(<FileUploadInput />);
    const button = screen
      .getByText("Drop files here or click to browse")
      .closest("button");
    const fileInput = container.querySelector('input[type="file"]');
    expect(button).not.toContainElement(fileInput as HTMLElement);
    expect(fileInput?.parentElement).toHaveClass("file-upload");
  });

  it("puts the id, name and required on the file input, not the button", () => {
    const { container } = render(
      <>
        <label htmlFor="docs">Documents</label>
        <FileUploadInput id="docs" name="docs" required />
      </>,
    );
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toHaveAttribute("id", "docs");
    expect(fileInput).toHaveAttribute("name", "docs");
    expect(fileInput).toBeRequired();
    const button = screen
      .getByText("Drop files here or click to browse")
      .closest("button");
    expect(button).not.toHaveAttribute("required");
    expect(button).not.toHaveAttribute("name");
    expect(fileInput?.parentElement).not.toHaveAttribute("id");
  });

  describe("mirroring the value into the file input", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it("sets the native input's files to the controlled value", () => {
      class FakeDataTransfer {
        readonly files: File[] = [];
        readonly items = { add: (file: File) => this.files.push(file) };
      }
      vi.stubGlobal("DataTransfer", FakeDataTransfer);
      const setFiles = vi
        .spyOn(HTMLInputElement.prototype, "files", "set")
        .mockImplementation(() => {});
      const file = new File(["hello"], "report.pdf");

      render(<FileUploadInput name="docs" value={[file]} />);

      expect(setFiles).toHaveBeenLastCalledWith([file]);
    });

    it("leaves the native input alone where DataTransfer is unavailable", () => {
      vi.stubGlobal("DataTransfer", undefined);
      const setFiles = vi.spyOn(HTMLInputElement.prototype, "files", "set");

      render(<FileUploadInput name="docs" value={[]} />);

      expect(setFiles).not.toHaveBeenCalled();
    });
  });

  it("supports the disabled state", () => {
    const { container } = render(<FileUploadInput disabled />);
    expect(
      screen.getByText("Drop files here or click to browse").closest("button"),
    ).toBeDisabled();
    expect(container.querySelector('input[type="file"]')).toBeDisabled();
  });
});
