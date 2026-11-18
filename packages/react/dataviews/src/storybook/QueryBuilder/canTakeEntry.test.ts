import { describe, expect, it } from "vitest";
import canTakeEntry from "./canTakeEntry.js";

describe("canTakeEntry", () => {
  it("lets a part take the Entry while another part holds a value", () => {
    const draft = { id: "c1", field: "status" };
    expect(canTakeEntry(draft, "operator")).toBe(true);
    expect(canTakeEntry(draft, "field")).toBe(false);
    expect(
      canTakeEntry({ ...draft, operator: "is", value: "ready" }, "field"),
    ).toBe(true);
  });
});
