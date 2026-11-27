import { describe, expect, it } from "vitest";
import spellColumnArrangement from "./spellColumnArrangement.js";

describe("spellColumnArrangement", () => {
  it("carries an arrangement's stored lists over the parameters, keeping the rest", () => {
    const params = new URLSearchParams("status=running&table.t.hidden=old");
    const spelled = spellColumnArrangement({
      table: "t",
      params,
      columns: [{ id: "name" }, { id: "status" }],
      presentation: { "table.t.hidden": ["zone", "status"] },
    });
    expect(spelled.toString()).toBe(
      "status=running&table.t.order=name&table.t.order=status&table.t.hidden=zone&table.t.hidden=status",
    );
    expect(params.getAll("table.t.hidden")).toEqual(["old"]);
  });

  it("carries no arrangement when given none", () => {
    expect(
      spellColumnArrangement({
        table: "t",
        params: new URLSearchParams("table.t.order=a&q=x"),
        columns: [{ id: "a" }],
        presentation: null,
      }).toString(),
    ).toBe("q=x");
  });
});
