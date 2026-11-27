import { describe, expect, it } from "vitest";
import formatFileSize from "./formatFileSize.js";

describe("formatFileSize", () => {
  it("formats bytes, kilobytes and megabytes", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(3 * 1024 * 1024)).toBe("3.0 MB");
  });
});
