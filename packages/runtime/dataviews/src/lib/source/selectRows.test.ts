import { describe, expect, it } from "vitest";
import { FACETED_ROWS, FACETED_SCHEMA } from "../../../testing/fixtures.js";
import { EMPTY_SLICE, type Predicate } from "../query/index.js";
import { createSchema } from "../schema/index.js";
import selectRows from "./selectRows.js";

/** The ids of the rows one predicate selects from the faceted rows. */
const selectIds = (predicate: Predicate): readonly unknown[] =>
  selectRows(
    FACETED_ROWS,
    { ...EMPTY_SLICE, filter: [predicate] },
    { schema: FACETED_SCHEMA },
    null,
  ).map((row) => (row as { readonly id: string }).id);

describe("selectRows", () => {
  describe("isSet", () => {
    it("selects the rows holding a value with true, false included", () => {
      expect(
        selectIds({ field: "owner", operator: "isSet", operands: [true] }),
      ).toEqual(["a", "d"]);
    });

    it("selects the rows holding none with false, null and absent alike", () => {
      expect(
        selectIds({ field: "owner", operator: "isSet", operands: [false] }),
      ).toEqual(["b", "c", "e", "g", "f"]);
    });

    it("asks for a value when the operand is missing", () => {
      expect(
        selectIds({ field: "owner", operator: "isSet", operands: [] }),
      ).toEqual(["a", "d"]);
    });
  });

  describe("a field scoped to record types", () => {
    const schema = createSchema([
      { field: "type", kind: "choices", options: ["vm", "container"] },
      { field: "secureboot", kind: "presence", appliesTo: ["vm"] },
    ]);
    const rows = [
      { id: "booted", type: "vm", secureboot: true },
      { id: "unbooted", type: "vm" },
      { id: "container", type: "container" },
    ];
    const types = { field: "type", names: ["vm", "container"] };
    const select = (operands: readonly boolean[], scoped = true) =>
      selectRows(
        rows,
        {
          ...EMPTY_SLICE,
          filter: [{ field: "secureboot", operator: "isSet", operands }],
        },
        { schema, types: scoped ? types : null },
        null,
      ).map(({ id }) => id);

    it("keeps a row of another type out of isSet with false", () => {
      expect(select([false])).toEqual(["unbooted"]);
      expect(select([true])).toEqual(["booted"]);
    });

    it("reads every row's type alike where the collection has one", () => {
      expect(select([false], false)).toEqual(["unbooted", "container"]);
    });
  });

  describe("is", () => {
    it("selects text equal to the operand once both are folded", () => {
      expect(
        selectIds({ field: "name", operator: "is", operands: ["ALPHA"] }),
      ).toEqual(["a"]);
    });

    it("selects no text that only holds the operand", () => {
      expect(
        selectIds({ field: "name", operator: "is", operands: ["alp"] }),
      ).toEqual([]);
    });

    it("selects nothing for an operand that is not text", () => {
      expect(
        selectIds({ field: "name", operator: "is", operands: [4] }),
      ).toEqual([]);
    });
  });
});
