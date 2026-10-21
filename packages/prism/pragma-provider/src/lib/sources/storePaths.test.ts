import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { compareByPath, formatStoreVisiblePath } from "./storePaths.js";

describe("formatStoreVisiblePath", () => {
  it("files the path relative to the package under its label", () => {
    const base = join("/", "refs", "design-system");
    expect(
      formatStoreVisiblePath(
        "design-system",
        base,
        join(base, "data", "tokens", "colors.ttl"),
      ),
    ).toBe("design-system/data/tokens/colors.ttl");
  });
});

describe("compareByPath", () => {
  it("orders by store-visible path", () => {
    expect(
      [{ path: "b/x.ttl" }, { path: "a/y.ttl" }, { path: "a/x.ttl" }]
        .sort(compareByPath)
        .map((file) => file.path),
    ).toEqual(["a/x.ttl", "a/y.ttl", "b/x.ttl"]);
  });
});
