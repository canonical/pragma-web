import { describe, expect, it } from "vitest";
import listGroupRefusals from "./listGroupRefusals.js";

const declareGroup = (levels: number) => ({
  fields: ["status"],
  levels,
  summaries: "counts" as const,
  collapse: false,
});

describe("listGroupRefusals", () => {
  it("refuses nothing within the declared levels", () => {
    expect(listGroupRefusals(declareGroup(1), [{ field: "status" }])).toEqual(
      [],
    );
  });

  it("says once that a source declaring no levels cannot group", () => {
    expect(
      listGroupRefusals(declareGroup(0), [{ field: "zone" }]).map(
        ({ reason }) => reason,
      ),
    ).toEqual(["this source cannot group"]);
  });

  it("reports an undeclared field beside the depth limit", () => {
    expect(
      listGroupRefusals(declareGroup(1), [
        { field: "status" },
        { field: "zone" },
      ]).map(({ code, field }) => [code, field]),
    ).toEqual([
      ["too-many-levels", null],
      ["undeclared-field", "zone"],
    ]);
  });
});
