import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { staticDirs } from "./preset.js";

describe("staticDirs", () => {
  it("serves the directory two levels above the preset, the package's public directory once built to dist/esm", () => {
    const presetDirectory = dirname(fileURLToPath(import.meta.url));
    expect(staticDirs).toEqual([join(presetDirectory, "../../public")]);
  });
});
