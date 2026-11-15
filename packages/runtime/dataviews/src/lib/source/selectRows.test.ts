import { describe, expect, it } from "vitest";
import { FACETED_ROWS, FACETED_SCHEMA } from "../../../testing/fixtures.js";
import { EMPTY_SLICE, type Predicate } from "../query/index.js";
import { createSchema } from "../schema/index.js";
import selectRows from "./selectRows.js";

/** Records holding a list of tags, or something that is not one. */
const TAGGED = [
  { id: "gpu", tags: ["ex-gpu", "ex-nvme"] },
  { id: "nvme", tags: ["ex-nvme"] },
  { id: "bare", tags: [] },
  { id: "single", tags: "ex-gpu" },
  { id: "absent" },
];

/** The tagged records' schema: tags from a closed list, labels the server's. */
const TAGGED_SCHEMA = createSchema([
  {
    field: "tags",
    kind: "choices",
    options: ["ex-gpu", "ex-nvme"],
    multiple: true,
  },
  { field: "labels", kind: "choices", multiple: true },
]);

/** The ids of the tagged records one predicate selects. */
const selectTagged = (predicate: Predicate): readonly unknown[] =>
  selectRows(
    TAGGED,
    { ...EMPTY_SLICE, filter: [predicate] },
    { schema: TAGGED_SCHEMA },
    null,
  ).map(({ id }) => id);

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
      { field: "image", kind: "text", appliesTo: ["container"] },
    ]);
    const rows = [
      { id: "booted", type: "vm", secureboot: true },
      { id: "unbooted", type: "vm" },
      { id: "container", type: "container", image: "ubuntu" },
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

    it("keeps a row of another type out of a text negation", () => {
      const negate = (operator: "isNot" | "notContains") =>
        selectRows(
          rows,
          {
            ...EMPTY_SLICE,
            filter: [{ field: "image", operator, operands: ["debian"] }],
          },
          { schema, types },
          null,
        ).map(({ id }) => id);
      expect(negate("isNot")).toEqual(["container"]);
      expect(negate("notContains")).toEqual(["container"]);
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

  describe("isNot", () => {
    it("selects every row the equal operand does not, those without text included", () => {
      expect(
        selectIds({ field: "name", operator: "isNot", operands: ["ALPHA"] }),
      ).toEqual(["b", "c", "d", "e", "g", "f"]);
    });
  });

  describe("notContains", () => {
    it("selects every row whose text lacks the operand, those without text included", () => {
      expect(
        selectIds({
          field: "name",
          operator: "notContains",
          operands: ["ALP"],
        }),
      ).toEqual(["b", "c", "d", "e", "g", "f"]);
    });
  });

  describe("endsWith", () => {
    it("selects text ending with the operand once both are folded", () => {
      expect(
        selectIds({ field: "name", operator: "endsWith", operands: ["TA"] }),
      ).toEqual(["b", "d"]);
    });
  });

  describe("negations", () => {
    it.each([
      ["isNot", "is"],
      ["notContains", "contains"],
    ] as const)(
      "selects with %s exactly the rows %s does not",
      (negation, held) => {
        const every = FACETED_ROWS.map(({ id }) => id);
        // "lp" is held inside alpha, never equal to anything.
        for (const operand of ["alpha", "A", "lp", "", "%", 4]) {
          const negated = selectIds({
            field: "name",
            operator: negation,
            operands: [operand],
          });
          const kept = selectIds({
            field: "name",
            operator: held,
            operands: [operand],
          });
          expect(every.filter((id) => !kept.includes(id))).toEqual(negated);
        }
      },
    );
  });

  describe("list-valued choices", () => {
    it("selects with isAny the lists holding any operand", () => {
      expect(
        selectTagged({
          field: "tags",
          operator: "isAny",
          operands: ["ex-gpu"],
        }),
      ).toEqual(["gpu"]);
    });

    it("selects with isNone the lists holding no operand, an empty list included", () => {
      expect(
        selectTagged({
          field: "tags",
          operator: "isNone",
          operands: ["ex-gpu"],
        }),
      ).toEqual(["nvme", "bare"]);
    });

    it("gives two conjuncts every operand", () => {
      expect(
        selectRows(
          TAGGED,
          {
            ...EMPTY_SLICE,
            filter: [
              { field: "tags", operator: "isAny", operands: ["ex-gpu"] },
              { field: "tags", operator: "isAny", operands: ["ex-nvme"] },
            ],
          },
          { schema: TAGGED_SCHEMA },
          null,
        ).map(({ id }) => id),
      ).toEqual(["gpu"]);
    });

    it("matches the server's options by their text", () => {
      expect(
        selectRows(
          [{ id: "n", labels: [42] }],
          {
            ...EMPTY_SLICE,
            filter: [{ field: "labels", operator: "isAny", operands: ["42"] }],
          },
          { schema: TAGGED_SCHEMA },
          null,
        ),
      ).toHaveLength(1);
    });
  });
});
