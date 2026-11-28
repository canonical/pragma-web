import { render } from "@canonical/svelte-ssr-test";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import { FileUploadInput } from "./index.js";
import type { FileUploadInputProps } from "./types.js";

const file = (name: string, size = 1, type = "text/plain"): File => {
  const created = new File(["x"], name, { type });
  Object.defineProperty(created, "size", { value: size });
  return created;
};

const never = () => new Promise<void>(() => {});

/** Server-renders the input and returns its HTML, without comments. */
const renderHtml = (props: FileUploadInputProps = {}): string =>
  render(FileUploadInput, { props }).container.innerHTML.replaceAll(
    /<!--[\s\S]*?-->/g,
    "",
  );

// Proves the presentational input renders to static HTML with no client
// runtime or form owner: the server-rendered floor for progressive
// enhancement.
describe("FileUploadInput (SSR)", () => {
  it("renders the drop area and its button without a form", () => {
    const html = renderHtml({ accept: "image/*", multiple: true });
    expect(html).toContain("ds input file-upload");
    expect(html).toContain("drop-area");
    expect(html).toContain("Drag and drop or");
    expect(html).toMatch(/<button[^>]*type="button"[^>]*>.*Choose files/);
    expect(html).toContain('accept="image/*"');
  });

  it("server-renders a named, required file input, so files post without scripting", () => {
    const html = renderHtml({ name: "docs", required: true });
    expect(html).toMatch(/<input[^>]*type="file"[^>]*name="docs"/);
    expect(html).toMatch(/<input[^>]*type="file"[^>]*required/);
    expect(html).not.toMatch(/<button[^>]*required/);
  });

  it("renders the file list with names and sizes", () => {
    const html = renderHtml({
      multiple: true,
      files: [file("report.pdf", 2048)],
    });
    expect(html).toContain('class="file-list"');
    expect(html).toContain("report.pdf");
    expect(html).toContain("2 kB");
    expect(html).toContain("Remove report.pdf");
  });

  it("renders an empty thumbnail box for an image, filled after hydration", () => {
    const html = renderHtml({ files: [file("photo.png", 10, "image/png")] });
    expect(html).toContain('<span class="thumbnail"></span>');
  });

  it("renders a per-file error with its message linked to the tile", () => {
    const html = renderHtml({ maxSize: 1, files: [file("big.txt", 2048)] });
    const [, messageId] =
      /<p class="file-message" id="([^"]+)"/.exec(html) ?? [];
    expect(messageId).toBeTruthy();
    expect(html).toContain(
      `class="file-item error" aria-describedby="${messageId}"`,
    );
    expect(html).toContain("File size exceeds 1 byte.");
  });

  it("renders a validateFile warning", () => {
    const html = renderHtml({
      files: [file("a.txt")],
      validateFile: () => ({ level: "warning", message: "Check it." }),
    });
    expect(html).toContain('class="file-item warning"');
    expect(html).toContain('aria-label="Warning:"');
  });

  it("hides the drop area in single-file mode once a file is chosen", () => {
    const html = renderHtml({ files: [file("a.txt")] });
    expect(html).not.toContain("drop-area");
    expect(html).toContain('type="file"');
  });

  it("renders an empty polite status region for a live upload", () => {
    const html = renderHtml({ upload: never, files: [file("a.txt")] });
    expect(html).toContain(
      '<span class="file-status" aria-live="polite"></span>',
    );
  });

  it("renders no file list while disabled", () => {
    const html = renderHtml({
      disabled: true,
      multiple: true,
      files: [file("a.txt")],
    });
    expect(html).not.toContain("file-list");
    expect(html).toMatch(/<button[^>]*disabled/);
  });

  it("renders the field-level error under the drop area", () => {
    const html = renderHtml({
      error: createRawSnippet(() => ({
        render: () => '<p class="ds field-error">Too many files.</p>',
      })),
    });
    expect(html).toMatch(
      /<div class="drop-area-group">.*<p class="ds field-error">Too many files.<\/p><\/div>/,
    );
  });

  it("renders the field-level error alone in its group without the drop area", () => {
    const html = renderHtml({
      showDropArea: false,
      files: [file("a.txt")],
      error: createRawSnippet(() => ({
        render: () => '<p class="ds field-error">Too many files.</p>',
      })),
    });
    expect(html).toContain(
      '<div class="drop-area-group"><p class="ds field-error">Too many files.</p></div>',
    );
    expect(html).not.toContain('class="drop-area"');
  });

  it("server-renders the thumbnail without a preview tooltip", () => {
    const html = renderHtml({ files: [file("photo.png", 10, "image/png")] });
    expect(html).not.toContain("tooltip");
  });

  it("server-renders the error class on the drop area while invalid", () => {
    const html = renderHtml({ "aria-invalid": true });
    expect(html).toContain('class="drop-area error"');
  });

  it("renders neither part when both are turned off", () => {
    const html = renderHtml({
      showDropArea: false,
      showFileList: false,
      files: [file("a.txt")],
    });
    expect(html).not.toContain("drop-area");
    expect(html).not.toContain("file-list");
    expect(html).toContain('type="file"');
  });
});
