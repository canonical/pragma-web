import {
  createCollection,
  declareCapabilities,
} from "@canonical/dataviews-core";
import { describe, expect, it } from "vitest";
import writeChoice from "./writeChoice.js";

const collection = createCollection({
  identify: (record: { readonly id: string }) => record.id,
  fields: [
    { field: "status", kind: "choices", options: ["ready", "deployed"] },
    { field: "pool", kind: "choices", options: ["gpu"] },
    { field: "owner", kind: "presence" },
  ],
});
const capabilities = declareCapabilities(collection, {
  filter: { status: ["isAny", "isNone"], pool: ["isAny"], owner: ["isSet"] },
});
const { schema } = collection;

const ready = {
  kind: "predicate",
  origin: null,
  field: "status",
  operator: "isNone",
  operands: ["ready"],
} as const;

describe("writeChoice", () => {
  it("drops a field's values, and its operator where the new field lacks it", () => {
    expect(
      writeChoice(
        ready,
        { kind: "field", field: "status" },
        schema,
        capabilities,
      ),
    ).toBe(ready);
    expect(
      writeChoice(
        ready,
        { kind: "field", field: "pool" },
        schema,
        capabilities,
      ),
    ).toEqual({ ...ready, field: "pool", operator: null, operands: [] });
    expect(
      writeChoice(
        { ...ready, operator: "isAny" },
        { kind: "field", field: "pool" },
        schema,
        capabilities,
      ),
    ).toMatchObject({ field: "pool", operator: "isAny", operands: [] });
    expect(
      writeChoice(
        ready,
        { kind: "field", field: "gone" },
        schema,
        capabilities,
      ),
    ).toMatchObject({ field: "gone", operator: null });
    expect(
      writeChoice(
        { ...ready, operator: null },
        { kind: "field", field: "pool" },
        schema,
        capabilities,
      ).operator,
    ).toBeNull();
  });

  it("keeps the values under another operator, unless it brings its own or leaves presence", () => {
    const choose = (operands: readonly boolean[] | null) =>
      ({ kind: "operator", operator: "isAny", operands }) as const;
    expect(writeChoice(ready, choose(null), schema, capabilities)).toEqual({
      ...ready,
      operator: "isAny",
    });
    expect(
      writeChoice(
        { ...ready, field: "owner", operator: "isSet", operands: [true] },
        { kind: "operator", operator: "isSet", operands: [false] },
        schema,
        capabilities,
      ).operands,
    ).toEqual([false]);
    expect(
      writeChoice(
        { ...ready, operator: "isSet", operands: [true] },
        choose(null),
        schema,
        capabilities,
      ).operands,
    ).toEqual([]);
  });

  it("adds a value once", () => {
    const deployed = { kind: "value", operand: "deployed" } as const;
    // In the order the query holds them, whatever the order picked.
    expect(writeChoice(ready, deployed, schema, capabilities).operands).toEqual(
      ["deployed", "ready"],
    );
    // Before an operator, as picked.
    expect(
      writeChoice({ ...ready, operator: null }, deployed, schema, capabilities)
        .operands,
    ).toEqual(["ready", "deployed"]);
    expect(
      writeChoice(
        ready,
        { kind: "value", operand: "ready" },
        schema,
        capabilities,
      ),
    ).toBe(ready);
  });
});
