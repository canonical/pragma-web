import { describe, expect, it } from "vitest";
import readArrangementParams from "./readArrangementParams.js";
import spellArrangementParams from "./spellArrangementParams.js";

describe("spellArrangementParams", () => {
  it("replaces the arrangement carried, keeping every other parameter and leaving the given ones alone", () => {
    const params = new URLSearchParams(
      "status=failed&table.t.hidden=old&status=running&table.t.order=old",
    );
    const spelled = spellArrangementParams(params, "t", {
      order: ["cores", "a&b"],
      hidden: ["name"],
    });
    expect(spelled.toString()).toBe(
      "status=failed&status=running&table.t.order=cores&table.t.order=a%26b&table.t.hidden=name",
    );
    expect(params.getAll("table.t.order")).toEqual(["old"]);
  });

  it("spells no arrangement as none, and hidden columns alone without an order", () => {
    const params = new URLSearchParams("table.t.order=a&table.t.hidden=b&q=x");
    expect(spellArrangementParams(params, "t", null).toString()).toBe("q=x");
    expect(
      spellArrangementParams(params, "t", {
        order: null,
        hidden: ["b"],
      }).toString(),
    ).toBe("q=x&table.t.hidden=b");
  });

  it("is read back as the arrangement it spells", () => {
    const arrangements = [
      { order: ["name", "cores"], hidden: [] },
      { order: ["name"], hidden: ["cores", "status"] },
      { order: null, hidden: ["cores"] },
    ];
    for (const arrangement of arrangements) {
      expect(
        readArrangementParams(
          spellArrangementParams(new URLSearchParams("q=x"), "t", arrangement),
        ).get("t") ?? null,
      ).toEqual(arrangement);
    }
  });

  it("replaces a table's arrangement spelled another way, so none shadows it", () => {
    const params = new URLSearchParams([
      ["table.a%2eb.order", "old"],
      ["table.a%2eb.hidden", "old"],
      ["q", "x"],
    ]);
    const spelled = spellArrangementParams(params, "a.b", {
      order: ["name"],
      hidden: [],
    });
    expect([...spelled.keys()]).toEqual(["q", "table.a%2Eb.order"]);
    expect(readArrangementParams(spelled).get("a.b")).toEqual({
      order: ["name"],
      hidden: [],
    });
  });
});
