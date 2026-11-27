import type { Predicate } from "@canonical/dataviews-core";
import { describe, expect, it } from "vitest";
import type { PlacedConjunct } from "../../../types.js";
import listPanelConjuncts from "./listPanelConjuncts.js";

const place = (predicate: Predicate, nth = 0): PlacedConjunct => ({
  predicate,
  ref: { field: predicate.field, operator: predicate.operator, nth },
});

describe("listPanelConjuncts", () => {
  it("claims the address of a choice's first set, and nothing else of the field", () => {
    const notBroken = place({
      field: "status",
      operator: "isNone",
      operands: ["broken"],
    });
    const ready = place({
      field: "status",
      operator: "isAny",
      operands: ["ready"],
    });
    const deployed = place(
      { field: "status", operator: "isAny", operands: ["deployed"] },
      1,
    );
    expect(
      listPanelConjuncts(
        { field: "status", kind: "choices" },
        [ready, deployed, notBroken],
        ["isAny", "isNone"],
      ),
    ).toEqual([ready, deployed]);
    expect(
      listPanelConjuncts({ field: "status", kind: "choices" }, [], ["isAny"]),
    ).toEqual([]);
  });

  it("claims each bound the source offers, a second one at its address too", () => {
    const low = place({ field: "memory", operator: "gte", operands: [1] });
    const lower = place({ field: "memory", operator: "gte", operands: [2] }, 1);
    const high = place({ field: "memory", operator: "lte", operands: [9] });
    expect(
      listPanelConjuncts(
        { field: "memory", kind: "number" },
        [low, lower, high],
        ["gte", "lte"],
      ),
    ).toEqual([low, lower, high]);
    expect(
      listPanelConjuncts(
        { field: "memory", kind: "number" },
        [low, lower, high],
        ["gte"],
      ),
    ).toEqual([low, lower]);
  });

  it("claims a text's value under each operator offered, and an offered presence", () => {
    const contains = place({
      field: "name",
      operator: "contains",
      operands: ["web"],
    });
    const isNot = place({ field: "name", operator: "isNot", operands: ["x"] });
    expect(
      listPanelConjuncts(
        { field: "name", kind: "text" },
        [contains, isNot],
        ["contains"],
      ),
    ).toEqual([contains]);
    const owned = place({
      field: "owner",
      operator: "isSet",
      operands: [true],
    });
    expect(
      listPanelConjuncts(
        { field: "owner", kind: "presence" },
        [owned],
        ["isSet"],
      ),
    ).toEqual([owned]);
    expect(
      listPanelConjuncts({ field: "owner", kind: "presence" }, [owned], []),
    ).toEqual([]);
  });
});
