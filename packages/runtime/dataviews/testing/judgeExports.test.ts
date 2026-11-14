import { describe, expect, it } from "vitest";
import judgeExports from "./judgeExports.js";
import type { ExportKind, ExportRecord } from "./types.js";

/** A named export of a kind. */
function named(kind: ExportKind, name = "a"): ExportRecord {
  return { name, kind, isDefault: false, isAtEnd: false };
}

/** A default export of a name. */
function byDefault(name: string | null): ExportRecord {
  return { name, kind: "function", isDefault: true, isAtEnd: false };
}

describe("judgeExports", () => {
  it("finds a file with no export", () => {
    expect(judgeExports("a", [])).toEqual(["none"]);
  });

  it("finds a default beside a named export, or two defaults", () => {
    expect(judgeExports("a", [byDefault("a"), named("type")])).toEqual([
      "mixed",
    ]);
    expect(judgeExports("a", [byDefault("a"), byDefault("a")])).toEqual([
      "mixed",
    ]);
  });

  it("accepts a default named as the file and finds one misnamed", () => {
    expect(judgeExports("a", [byDefault("a")])).toEqual([]);
    expect(judgeExports("a", [byDefault(null)])).toEqual(["default-misnamed"]);
  });

  it("finds named exports of several kinds", () => {
    expect(judgeExports("a", [named("type"), named("value")])).toEqual([
      "mixed",
    ]);
  });

  it("accepts only types", () => {
    expect(judgeExports("a", [named("type")])).toEqual([]);
  });

  it("owes a default for one named value outside constants", () => {
    expect(judgeExports("a", [named("value")])).toEqual(["one-value"]);
    expect(judgeExports("constants", [named("value")])).toEqual([]);
    expect(judgeExports("a", [named("value"), named("value")])).toEqual([]);
  });

  it("owes a default for named functions", () => {
    expect(judgeExports("a", [named("function")])).toEqual(["one-function"]);
    expect(judgeExports("a", [named("function"), named("function")])).toEqual([
      "several-functions",
    ]);
  });

  it("owes a default for named classes", () => {
    expect(judgeExports("a", [named("class")])).toEqual(["one-class"]);
    expect(judgeExports("a", [named("class"), named("class")])).toEqual([
      "several-classes",
    ]);
  });

  it("finds a re-export outside a barrel and an unknown export", () => {
    expect(judgeExports("a", [named("reexport")])).toEqual([
      "reexport-outside-barrel",
    ]);
    expect(judgeExports("a", [named("unknown")])).toEqual(["unknown"]);
  });

  it("finds an export at the end and a memo over a function", () => {
    expect(judgeExports("a", [{ ...byDefault("a"), isAtEnd: true }])).toEqual([
      "exported-at-end",
    ]);
    expect(
      judgeExports("a", [
        { ...byDefault("a"), wrapper: "memo", wrapsFunction: true },
      ]),
    ).toEqual(["memo-over-function"]);
  });
});
