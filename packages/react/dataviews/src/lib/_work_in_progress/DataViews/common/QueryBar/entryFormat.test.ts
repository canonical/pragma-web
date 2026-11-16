import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { describe, expect, it } from "vitest";
import entryFormat from "./entryFormat.js";

const messages = resolveMessages();

const memory = {
  field: "memory",
  kind: "number",
  units: {
    base: "MiB",
    display: [
      { symbol: "MiB", factor: 1 },
      { symbol: "GiB", factor: 1024 },
    ],
  },
} as const;

describe("entryFormat", () => {
  it("shapes a date's value with its template and its words", () => {
    expect(
      entryFormat({ field: "seen", kind: "date" }, "value", "", messages),
    ).toEqual({
      template: "YYYY-MM-DD",
      formatDescription: "Date, format YYYY-MM-DD",
    });
  });

  it("names a number's units, with the base unit after digits typed alone", () => {
    expect(entryFormat(memory, "value", "64", messages)).toEqual({
      formatDescription: "Number, in MiB or GiB",
      suffix: "MiB",
    });
    expect(entryFormat(memory, "value", "64 G", messages)).toEqual({
      formatDescription: "Number, in MiB or GiB",
    });
    expect(
      entryFormat({ field: "cores", kind: "number" }, "value", "4", messages),
    ).toEqual({ formatDescription: "Number" });
  });

  it("shapes no other part, kind or missing field", () => {
    expect(entryFormat(memory, "operator", "", messages)).toEqual({});
    expect(
      entryFormat({ field: "name", kind: "text" }, "value", "", messages),
    ).toEqual({});
    expect(entryFormat(undefined, "value", "", messages)).toEqual({});
  });
});
