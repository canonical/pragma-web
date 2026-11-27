import { describe, expect, it } from "vitest";
import messages from "../messages.js";
import formatFileSize from "./formatFileSize.js";
import getFileMessage from "./getFileMessage.js";
import matchesAccept from "./matchesAccept.js";

const file = (name: string, type = "", size = 1): File => {
  const created = new File(["x"], name, { type });
  Object.defineProperty(created, "size", { value: size });
  return created;
};

describe("formatFileSize", () => {
  it("steps by 1024 and keeps one decimal", () => {
    expect(formatFileSize(512)).toBe("512 byte");
    expect(formatFileSize(1536)).toBe("1.5 kB");
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5 MB");
    expect(formatFileSize(2.5 * 1024 ** 3)).toBe("2.5 GB");
    expect(formatFileSize(3 * 1024 ** 5)).toBe("3,072 TB");
  });

  it("formats in the given locale", () => {
    expect(formatFileSize(1536 * 1024, "de")).toBe("1,5 MB");
  });
});

describe("matchesAccept", () => {
  it("accepts every file for an empty list", () => {
    expect(matchesAccept(file("a.bin"), " , ")).toBe(true);
  });

  it("matches extensions, wildcard types and exact types, ignoring case", () => {
    expect(matchesAccept(file("Report.PDF"), ".pdf")).toBe(true);
    expect(matchesAccept(file("photo", "image/png"), "image/*")).toBe(true);
    expect(
      matchesAccept(file("doc", "application/pdf"), "application/pdf"),
    ).toBe(true);
    expect(
      matchesAccept(file("notes.txt", "text/plain"), ".pdf, image/*"),
    ).toBe(false);
  });
});

describe("getFileMessage", () => {
  it("prefers the accept error, then the size error, then validateFile", () => {
    const validateFile = () => ({
      level: "warning" as const,
      message: "Careful.",
    });
    const big = file("a.txt", "text/plain", 10);
    expect(
      getFileMessage(
        big,
        { accept: ".pdf", maxSize: 1, validateFile },
        messages,
      ),
    ).toEqual({ level: "error", message: "File type is not accepted." });
    expect(getFileMessage(big, { maxSize: 1, validateFile }, messages)).toEqual(
      { level: "error", message: "File size exceeds 1 byte." },
    );
    expect(getFileMessage(big, { validateFile }, messages)).toEqual({
      level: "warning",
      message: "Careful.",
    });
    expect(getFileMessage(big, {}, messages)).toBeUndefined();
  });
});

describe("messages", () => {
  it("words the field-level and per-file texts", () => {
    expect(messages.tooManyFiles(1)).toBe("You can upload at most 1 file.");
    expect(messages.tooManyFiles(3)).toBe("You can upload at most 3 files.");
    expect(messages.messageLevel("warning")).toBe("Warning:");
    expect(messages.filesHaveErrors()).toBe(
      "Remove the files that have errors.",
    );
    expect(messages.uploadsPending()).toBe("Wait for the uploads to finish.");
    expect(messages.uploadsFailed()).toBe(
      "Retry or remove the files that failed to upload.",
    );
  });
});
