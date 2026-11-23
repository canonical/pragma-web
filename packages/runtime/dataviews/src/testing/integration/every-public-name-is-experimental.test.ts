import path from "node:path";
import { describe, expect, it } from "vitest";
import { listUnmarkedNames } from "../../../testing/index.js";

/** The names one entry point's barrel exports without the tag. */
const listUnmarked = (barrel: string): readonly string[] =>
  listUnmarkedNames(path.resolve(barrel), path.resolve("src/lib"));

describe("every public name is experimental", () => {
  it("tags every name the root exports", () => {
    expect(listUnmarked("src/lib/index.ts")).toEqual([]);
  });

  it("tags every name ./bindings exports", () => {
    expect(listUnmarked("src/lib/bindings/index.ts")).toEqual([]);
  });

  it("tags every name ./indexeddb and ./virtualization export", () => {
    expect(listUnmarked("src/lib/indexeddb/index.ts")).toEqual([]);
    expect(listUnmarked("src/lib/virtualization/index.ts")).toEqual([]);
  });

  it("tags every name ./testing exports", () => {
    expect(
      listUnmarkedNames(
        path.resolve("testing/index.ts"),
        path.resolve("testing"),
      ),
    ).toEqual([]);
  });
});
