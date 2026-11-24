import { describe, expect, it } from "vitest";
import findNextPart from "./findNextPart.js";
import type { QueryState } from "./types.js";

const createState = (overrides: Partial<QueryState>): QueryState => ({
  clauses: [{ id: "c1", field: "status", operator: "is", value: "ready" }],
  text: "",
  edit: undefined,
  activeItem: "entry",
  focusPart: undefined,
  nextId: 2,
  ...overrides,
});

const createEdit = (part: "field" | "operator" | "value", isDraft = false) => ({
  id: "c1",
  part,
  text: "",
  isDraft,
  original: undefined,
});

describe("findNextPart", () => {
  it("finds nothing without an open edit", () => {
    expect(findNextPart(createState({}), false)).toBeUndefined();
  });

  it("walks an edited chip's parts both ways, and stops at either end", () => {
    expect(
      findNextPart(createState({ edit: createEdit("field") }), false),
    ).toBe("operator");
    expect(findNextPart(createState({ edit: createEdit("value") }), true)).toBe(
      "operator",
    );
    expect(
      findNextPart(createState({ edit: createEdit("value") }), false),
    ).toBeUndefined();
    expect(
      findNextPart(createState({ edit: createEdit("field") }), true),
    ).toBeUndefined();
  });

  it("walks every part of a draft, back to its field from its operator", () => {
    const clauses = [{ id: "c1", field: "status" }];
    expect(
      findNextPart(
        createState({ clauses, edit: createEdit("operator", true) }),
        false,
      ),
    ).toBe("value");
    expect(
      findNextPart(
        createState({ clauses, edit: createEdit("operator", true) }),
        true,
      ),
    ).toBe("field");
  });
});
