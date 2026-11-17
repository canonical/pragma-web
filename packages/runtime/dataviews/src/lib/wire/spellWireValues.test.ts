import { describe, expect, it } from "vitest";
import spellWireValues from "./spellWireValues.js";

describe("spellWireValues", () => {
  it("spells presence as its marker", () => {
    expect(
      spellWireValues({ field: "owner", operator: "isSet", operands: [] }),
    ).toEqual(["1"]);
  });

  it("spells a set's options by their own string form, in order", () => {
    expect(
      spellWireValues({
        field: "cores",
        operator: "isAny",
        operands: [8, true, "ex-gpu", 1e21],
      }),
    ).toEqual(["8", "true", "ex-gpu", "1e+21"]);
  });

  it("spells a bound as the plain decimal the input grammar reads", () => {
    const spell = (value: number) =>
      spellWireValues({ field: "memory", operator: "gte", operands: [value] });
    expect(spell(16)).toEqual(["16"]);
    expect(spell(1e21)).toEqual(["1000000000000000000000"]);
    expect(spell(-1.5e22)).toEqual(["-15000000000000000000000"]);
    expect(spell(1e-7)).toEqual(["0.0000001"]);
    expect(spell(-2.5e-7)).toEqual(["-0.00000025"]);
  });

  it("spells a text or a date as it is", () => {
    expect(
      spellWireValues({
        field: "updated",
        operator: "lte",
        operands: ["2026-01-02"],
      }),
    ).toEqual(["2026-01-02"]);
  });
});
