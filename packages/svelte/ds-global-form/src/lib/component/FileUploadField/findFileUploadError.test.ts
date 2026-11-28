import { describe, expect, it } from "vitest";
import type { FileUploadMessages } from "../../subcomponent/FileUploadInput/index.js";
import findFileUploadError from "./findFileUploadError.js";

const file = (name: string, size = 1): File => {
  const created = new File(["x"], name, { type: "text/plain" });
  Object.defineProperty(created, "size", { value: size });
  return created;
};

const messages = {
  tooManyFiles: () => "too many",
  filesHaveErrors: () => "file errors",
  uploadsPending: () => "pending",
  uploadsFailed: () => "failed",
  fileSize: String,
  fileTooLarge: () => "too large",
  fileTypeNotAccepted: () => "not accepted",
} as unknown as FileUploadMessages;

const idle = { uploading: 0, failed: 0 };

describe("findFileUploadError", () => {
  it("passes a valid selection", () => {
    expect(findFileUploadError([], {}, messages, idle)).toBeUndefined();
    expect(
      findFileUploadError(
        [file("a.txt", 5)],
        { maxFiles: 1, maxSize: 5 },
        messages,
        idle,
      ),
    ).toBeUndefined();
  });

  it("reports the first failing rule, in order", () => {
    const pending = { uploading: 1, failed: 0 };
    const files = [file("a.txt", 5)];
    expect(
      findFileUploadError(
        files,
        { maxFiles: 0, maxSize: 0 },
        messages,
        pending,
      ),
    ).toBe("too many");
    expect(findFileUploadError(files, { maxSize: 0 }, messages, pending)).toBe(
      "file errors",
    );
    expect(findFileUploadError(files, {}, messages, pending)).toBe("pending");
    expect(
      findFileUploadError(files, {}, messages, { uploading: 0, failed: 2 }),
    ).toBe("failed");
  });

  it("does not fail on a file warning", () => {
    expect(
      findFileUploadError(
        [file("a.txt")],
        { validateFile: () => ({ level: "warning", message: "Big." }) },
        messages,
        idle,
      ),
    ).toBeUndefined();
  });
});
