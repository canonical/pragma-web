import { describe, expect, it } from "vitest";
import canTakeEntry from "./canTakeEntry.js";

const draft = {
  kind: "predicate",
  origin: null,
  field: "status",
  operands: [],
} as const;

describe("canTakeEntry", () => {
  it("keeps a draft's field while it is the chip's only Segment", () => {
    expect(canTakeEntry({ ...draft, operator: null }, "field")).toBe(false);
    expect(canTakeEntry({ ...draft, operator: null }, "operator")).toBe(true);
    expect(canTakeEntry({ ...draft, operator: "isAny" }, "field")).toBe(true);
  });

  it("lets the search's one part take it", () => {
    expect(
      canTakeEntry(
        { kind: "search", origin: { id: "search", ref: null }, text: "ex" },
        "search",
      ),
    ).toBe(true);
  });
});
