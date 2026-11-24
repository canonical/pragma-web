import { describe, expect, it } from "vitest";
import readFileRole from "./readFileRole.js";

describe("readFileRole", () => {
  it("reads each role from the file name", () => {
    expect(
      [
        "a.test.tsx",
        "a.d.ts",
        "a.stories.tsx",
        "a.spec.ts",
        "a.keyboard.ts",
        "vite.config.mts",
        "index.ts",
        "a.css",
        "a.tsx",
        "a.md",
      ].map(readFileRole),
    ).toEqual([
      "test",
      "d.ts",
      "stories",
      "spec",
      "spec",
      "config",
      "barrel",
      "css",
      "source",
      "other",
    ]);
  });
});
