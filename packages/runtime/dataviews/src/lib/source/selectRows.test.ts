import { describe, expect, it } from "vitest";
import {
  FACETED_ROWS,
  FACETED_SCHEMA,
  readId,
} from "../../../testing/index.js";
import { EMPTY_SLICE, type Predicate, type Slice } from "../query/index.js";
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

/** The ids of the fixture rows a filter and search select, searching `name` and `cpu`. */
const selectIds = (
  filter: readonly Predicate[],
  search: string | null = null,
  lifted: string | null = null,
): readonly string[] => {
  const slice: Slice = { ...EMPTY_SLICE, filter, search };
  return selectRows(
    FACETED_ROWS,
    slice,
    { schema: FACETED_SCHEMA, searchFields: ["name", "cpu"] },
    lifted,
  ).map(readId);
};

describe("selectRows", () => {
  it("selects every row, in order, for a slice restricting nothing", () => {
    expect(selectIds([])).toEqual(["a", "b", "c", "d", "e", "g", "f"]);
  });

  describe("isSet", () => {
    it("selects the rows holding a value with true, false included", () => {
      expect(
        selectIds([{ field: "owner", operator: "isSet", operands: [true] }]),
      ).toEqual(["a", "d"]);
    });

    it("selects the rows holding none with false, null and absent alike", () => {
      expect(
        selectIds([{ field: "owner", operator: "isSet", operands: [false] }]),
      ).toEqual(["b", "c", "e", "g", "f"]);
    });

    it("asks for a value when the operand is missing", () => {
      expect(
        selectIds([{ field: "owner", operator: "isSet", operands: [] }]),
      ).toEqual(["a", "d"]);
    });
  });

  it("selects only choice values for isAny and isNone", () => {
    expect(
      selectIds([{ field: "status", operator: "isAny", operands: ["failed"] }]),
    ).toEqual(["b", "c"]);
    expect(
      selectIds([
        { field: "status", operator: "isNone", operands: ["failed"] },
      ]),
    ).toEqual(["a", "d", "g"]);
  });

  it("compares a value by its text against the server's options", () => {
    const schema = createSchema([{ field: "code", kind: "choices" }]);
    const rows = [
      { id: "a", code: 1 },
      { id: "b", code: "2" },
    ];
    const slice: Slice = {
      ...EMPTY_SLICE,
      filter: [{ field: "code", operator: "isAny", operands: ["1", "2"] }],
    };
    expect(selectRows(rows, slice, { schema }, null).map(readId)).toEqual([
      "a",
      "b",
    ]);
  });

  it.fails("filters on a nested field by its dot path", () => {
    const schema = createSchema([{ field: "config.region", kind: "choices" }]);
    const rows = [
      { id: "a", config: { region: "eu" } },
      { id: "b", config: { region: "us" } },
    ];
    const slice: Slice = {
      ...EMPTY_SLICE,
      filter: [{ field: "config.region", operator: "isAny", operands: ["us"] }],
    };
    expect(selectRows(rows, slice, { schema }, null).map(readId)).toEqual([
      "b",
    ]);
  });

  it.fails("searches a nested field by its dot path", () => {
    const schema = createSchema([{ field: "config.region", kind: "text" }]);
    const rows = [
      { id: "a", config: { region: "eu" } },
      { id: "b", config: { region: "us" } },
    ];
    const slice: Slice = { ...EMPTY_SLICE, search: "us" };
    expect(
      selectRows(
        rows,
        slice,
        { schema, searchFields: ["config.region"] },
        null,
      ).map(readId),
    ).toEqual(["b"]);
  });

  it("selects a range through the field's kind", () => {
    expect(
      selectIds([{ field: "cpu", operator: "gte", operands: [16] }]),
    ).toEqual(["b", "d"]);
    expect(
      selectIds([{ field: "cpu", operator: "lte", operands: [8] }]),
    ).toEqual(["a", "c"]);
  });

  it("selects nothing for a range with no bound, no field, or no order", () => {
    expect(
      selectIds([{ field: "cpu", operator: "gte", operands: [] }]),
    ).toEqual([]);
    expect(
      selectIds([{ field: "ram", operator: "gte", operands: [1] }]),
    ).toEqual([]);
    expect(
      selectIds([{ field: "owner", operator: "gte", operands: ["ex:a"] }]),
    ).toEqual([]);
  });

  it("selects text holding or starting with the folded operand", () => {
    expect(
      selectIds([{ field: "name", operator: "contains", operands: ["TA"] }]),
    ).toEqual(["b", "d"]);
    expect(
      selectIds([{ field: "name", operator: "startsWith", operands: ["Ga"] }]),
    ).toEqual(["c"]);
  });

  it("selects nothing for text looked for with an operand that is not text", () => {
    expect(
      selectIds([{ field: "name", operator: "contains", operands: [4] }]),
    ).toEqual([]);
  });

  it("searches text and numbers in the declared fields, folded", () => {
    expect(selectIds([], "ALP")).toEqual(["a"]);
    expect(selectIds([], "32")).toEqual(["d"]);
    expect(selectIds([], "zeta")).toEqual([]);
  });

  it("searches nothing when no field is declared searchable", () => {
    const slice: Slice = { ...EMPTY_SLICE, search: "alpha" };
    expect(
      selectRows(FACETED_ROWS, slice, { schema: FACETED_SCHEMA }, null),
    ).toEqual([]);
  });

  it("leaves out the predicates over the lifted field", () => {
    const failed: Predicate = {
      field: "status",
      operator: "isAny",
      operands: ["failed"],
    };
    expect(selectIds([failed], null, "status")).toHaveLength(
      FACETED_ROWS.length,
    );
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
        selectIds([{ field: "name", operator: "is", operands: ["ALPHA"] }]),
      ).toEqual(["a"]);
    });

    it("selects no text that only holds the operand", () => {
      expect(
        selectIds([{ field: "name", operator: "is", operands: ["alp"] }]),
      ).toEqual([]);
    });

    it("selects nothing for an operand that is not text", () => {
      expect(
        selectIds([{ field: "name", operator: "is", operands: [4] }]),
      ).toEqual([]);
    });
  });

  describe("isNot", () => {
    it("selects every row the equal operand does not, those without text included", () => {
      expect(
        selectIds([{ field: "name", operator: "isNot", operands: ["ALPHA"] }]),
      ).toEqual(["b", "c", "d", "e", "g", "f"]);
    });
  });

  describe("notContains", () => {
    it("selects every row whose text lacks the operand, those without text included", () => {
      expect(
        selectIds([
          {
            field: "name",
            operator: "notContains",
            operands: ["ALP"],
          },
        ]),
      ).toEqual(["b", "c", "d", "e", "g", "f"]);
    });
  });

  describe("endsWith", () => {
    it("selects text ending with the operand once both are folded", () => {
      expect(
        selectIds([{ field: "name", operator: "endsWith", operands: ["TA"] }]),
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
        const every = FACETED_ROWS.map(readId);
        // "lp" is held inside alpha, never equal to anything.
        for (const operand of ["alpha", "A", "lp", "", "%", 4]) {
          const negated = selectIds([
            {
              field: "name",
              operator: negation,
              operands: [operand],
            },
          ]);
          const kept = selectIds([
            {
              field: "name",
              operator: held,
              operands: [operand],
            },
          ]);
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
