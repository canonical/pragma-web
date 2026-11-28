import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FileUploadInput } from "./FileUploadInput.js";

const file = (name: string, size = 1, type = "text/plain"): File => {
  const created = new File(["x"], name, { type });
  Object.defineProperty(created, "size", { value: size });
  return created;
};

const never = () => new Promise<void>(() => {});

// Proves the presentational input renders to static HTML with no client
// runtime / form context — the server-rendered floor for progressive
// enhancement.
describe("FileUploadInput (SSR)", () => {
  it("renders the drop area and its button without a form context", () => {
    const html = renderToString(<FileUploadInput accept="image/*" multiple />);
    expect(html).toContain("ds input file-upload");
    expect(html).toContain("drop-area");
    expect(html).toContain("Drag and drop or");
    expect(html).toMatch(/<button[^>]*type="button"[^>]*>.*Choose files/);
    expect(html).toContain('accept="image/*"');
  });

  it("server-renders a named, required file input, so files post without scripting", () => {
    const html = renderToString(<FileUploadInput name="docs" required />);
    expect(html).toMatch(/<input[^>]*type="file"[^>]*name="docs"/);
    expect(html).toMatch(/<input[^>]*type="file"[^>]*required/);
    expect(html).not.toMatch(/<button[^>]*required/);
  });

  it("renders the file list with names and sizes", () => {
    const html = renderToString(
      <FileUploadInput multiple value={[file("report.pdf", 2048)]} />,
    );
    expect(html).toContain('class="file-list"');
    expect(html).toContain("report.pdf");
    expect(html).toContain("2 kB");
    expect(html).toContain("Remove report.pdf");
  });

  it("renders an empty thumbnail box for an image, filled after hydration", () => {
    const html = renderToString(
      <FileUploadInput value={[file("photo.png", 10, "image/png")]} />,
    );
    expect(html).toContain('<span class="thumbnail"></span>');
  });

  it("renders a per-file error with its message linked to the tile", () => {
    const html = renderToString(
      <FileUploadInput maxSize={1} value={[file("big.txt", 2048)]} />,
    );
    const [, messageId] =
      /<p class="file-message" id="([^"]+)"/.exec(html) ?? [];
    expect(messageId).toBeTruthy();
    expect(html).toContain(
      `class="file-item error" aria-describedby="${messageId}"`,
    );
    expect(html).toContain("File size exceeds 1 byte.");
  });

  it("renders a validateFile warning", () => {
    const html = renderToString(
      <FileUploadInput
        value={[file("a.txt")]}
        validateFile={() => ({ level: "warning", message: "Check it." })}
      />,
    );
    expect(html).toContain('class="file-item warning"');
    expect(html).toContain('aria-label="Warning:"');
  });

  it("hides the drop area in single-file mode once a file is chosen", () => {
    const html = renderToString(<FileUploadInput value={[file("a.txt")]} />);
    expect(html).not.toContain("drop-area");
    expect(html).toContain('type="file"');
  });

  it("renders an empty polite status region for a live upload", () => {
    const html = renderToString(
      <FileUploadInput upload={never} value={[file("a.txt")]} />,
    );
    expect(html).toContain(
      '<span class="file-status" aria-live="polite"></span>',
    );
  });

  it("renders no file list while disabled", () => {
    const html = renderToString(
      <FileUploadInput disabled multiple value={[file("a.txt")]} />,
    );
    expect(html).not.toContain("file-list");
    expect(html).toMatch(/<button[^>]*disabled/);
  });

  it("renders the field-level error under the drop area", () => {
    const html = renderToString(
      <FileUploadInput
        error={<p className="ds field-error">Too many files.</p>}
      />,
    );
    expect(html).toMatch(
      /<div class="drop-area-group">.*<p class="ds field-error">Too many files.<\/p><\/div>/,
    );
  });

  it("renders the field-level error alone in its group without the drop area", () => {
    const html = renderToString(
      <FileUploadInput
        showDropArea={false}
        value={[file("a.txt")]}
        error={<p className="ds field-error">Too many files.</p>}
      />,
    );
    expect(html).toContain(
      '<div class="drop-area-group"><p class="ds field-error">Too many files.</p></div>',
    );
    expect(html).not.toContain('class="drop-area"');
  });

  it("server-renders the thumbnail without its preview tooltip", () => {
    const html = renderToString(
      <FileUploadInput value={[file("photo.png", 10, "image/png")]} />,
    );
    expect(html).not.toContain("tooltip");
  });

  it("server-renders the error class on the drop area while invalid", () => {
    const html = renderToString(<FileUploadInput aria-invalid />);
    expect(html).toContain('class="drop-area error"');
  });

  it("renders neither part when both are turned off", () => {
    const html = renderToString(
      <FileUploadInput
        showDropArea={false}
        showFileList={false}
        value={[file("a.txt")]}
      />,
    );
    expect(html).not.toContain("drop-area");
    expect(html).not.toContain("file-list");
    expect(html).toContain('type="file"');
  });
});
