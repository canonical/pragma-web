import { describe, expect, it } from "vitest";
import judgeExports from "./judgeExports.js";
import type { ExportKind, ExportRecord } from "./types.js";

/** A named export of a kind. */
function buildNamed(kind: ExportKind, name = "a"): ExportRecord {
  return { name, kind, isDefault: false, isAtEnd: false };
}

/** A default export of a name. */
function buildDefault(name: string | null): ExportRecord {
  return { name, kind: "function", isDefault: true, isAtEnd: false };
}

describe("judgeExports", () => {
  it("finds a file with no export", () => {
    expect(judgeExports("a", [])).toEqual(["none"]);
  });

  it("finds a default beside a named export, or two defaults", () => {
    expect(judgeExports("a", [buildDefault("a"), buildNamed("type")])).toEqual([
      "mixed",
    ]);
    expect(judgeExports("a", [buildDefault("a"), buildDefault("a")])).toEqual([
      "mixed",
    ]);
  });

  it("accepts a default named as the file and finds one misnamed", () => {
    expect(judgeExports("a", [buildDefault("a")])).toEqual([]);
    expect(judgeExports("a", [buildDefault(null)])).toEqual([
      "default-misnamed",
    ]);
  });

  it("finds named exports of several kinds", () => {
    expect(
      judgeExports("a", [buildNamed("type"), buildNamed("value")]),
    ).toEqual(["mixed"]);
  });

  it("accepts only types", () => {
    expect(judgeExports("a", [buildNamed("type")])).toEqual([]);
  });

  it("owes a default for one named value outside constants", () => {
    expect(judgeExports("a", [buildNamed("value")])).toEqual(["one-value"]);
    expect(judgeExports("constants", [buildNamed("value")])).toEqual([]);
    expect(
      judgeExports("a", [buildNamed("value"), buildNamed("value")]),
    ).toEqual([]);
  });

  it("owes a default for named functions", () => {
    expect(judgeExports("a", [buildNamed("function")])).toEqual([
      "one-function",
    ]);
    expect(
      judgeExports("a", [buildNamed("function"), buildNamed("function")]),
    ).toEqual(["several-functions"]);
  });

  it("owes a default for named classes", () => {
    expect(judgeExports("a", [buildNamed("class")])).toEqual(["one-class"]);
    expect(
      judgeExports("a", [buildNamed("class"), buildNamed("class")]),
    ).toEqual(["several-classes"]);
  });

  it("finds a re-export outside a barrel and an unknown export", () => {
    expect(judgeExports("a", [buildNamed("reexport")])).toEqual([
      "reexport-outside-barrel",
    ]);
    expect(judgeExports("a", [buildNamed("unknown")])).toEqual(["unknown"]);
  });

  it("finds an export at the end and a memo over a function", () => {
    expect(
      judgeExports("a", [{ ...buildDefault("a"), isAtEnd: true }]),
    ).toEqual(["exported-at-end"]);
    expect(
      judgeExports("a", [
        { ...buildDefault("a"), wrapper: "memo", wrapsFunction: true },
      ]),
    ).toEqual(["memo-over-function"]);
  });
});
