import { describe, expect, it } from "vitest";
import reduceSession from "./reduceSession.js";
import type { QueryBarDraft, QueryBarSession } from "./types.js";

const idle: QueryBarSession = {
  text: "sta",
  draft: null,
  part: null,
  typed: "",
  invalid: null,
  activeItem: "entry",
  focus: null,
};

const built: QueryBarDraft = {
  kind: "predicate",
  origin: null,
  field: "status",
  operator: null,
  operands: [],
};

const edited: QueryBarDraft = {
  kind: "predicate",
  origin: {
    id: "status__isAny__0",
    ref: { field: "status", operator: "isAny", nth: 0 },
    held: { field: "status", operator: "isAny", operands: ["ready"] },
  },
  field: "status",
  operator: "isAny",
  operands: ["ready"],
};

describe("reduceSession", () => {
  it("keeps what is typed in each entry", () => {
    expect(reduceSession(idle, { type: "typeText", text: "stat" }).text).toBe(
      "stat",
    );
    const invalid = { ...idle, invalid: "not a number" };
    expect(reduceSession(invalid, { type: "typePart", text: "6" })).toEqual({
      ...idle,
      typed: "6",
    });
  });

  it("opens a draft on its part, taking the free text, with the stop on its Entry", () => {
    const open = reduceSession(idle, {
      type: "edit",
      draft: built,
      part: "operator",
      typed: "",
    });
    expect(open).toEqual({
      ...idle,
      text: "",
      draft: built,
      part: "operator",
      activeItem: "draft:entry",
    });
    // Moving on to the next part keeps the free text as it is.
    const moved = reduceSession(
      { ...open, text: "kept", focus: { item: "x", part: "field" } },
      { type: "edit", draft: built, part: "value", typed: "6" },
    );
    expect(moved).toMatchObject({
      text: "kept",
      part: "value",
      typed: "6",
      focus: null,
    });
  });

  it("opens an edit on its clause's chip and leaves the free text", () => {
    expect(
      reduceSession(idle, {
        type: "edit",
        draft: edited,
        part: "value",
        typed: "",
      }),
    ).toMatchObject({ text: "sta", activeItem: "status__isAny__0:entry" });
  });

  it("marks what was typed invalid", () => {
    expect(
      reduceSession(idle, { type: "invalid", reason: "not a number" }).invalid,
    ).toBe("not a number");
  });

  it("closes the Entry onto an item, naming the Segment to focus for an edit", () => {
    const open = { ...idle, draft: edited, part: "value", typed: "x" } as const;
    expect(
      reduceSession(open, {
        type: "close",
        item: "status__isAny__0",
        focus: "value",
      }),
    ).toEqual({
      ...idle,
      activeItem: "status__isAny__0",
      focus: { item: "status__isAny__0", part: "value" },
    });
    expect(
      reduceSession(open, { type: "close", item: "entry", focus: null }).focus,
    ).toBeNull();
  });

  it("ends an edit when the stop leaves its chip, and keeps it within", () => {
    const open = {
      ...idle,
      draft: edited,
      part: "value",
      activeItem: "status__isAny__0:entry",
    } as const;
    expect(
      reduceSession(open, { type: "moveStop", item: "status__isAny__0" }),
    ).toMatchObject({ draft: edited, activeItem: "status__isAny__0" });
    expect(
      reduceSession(open, { type: "moveStop", item: "entry" }),
    ).toMatchObject({
      draft: null,
      part: null,
      activeItem: "entry",
    });
    expect(
      reduceSession(
        { ...idle, focus: { item: "a", part: "field" } },
        { type: "moveStop", item: "a" },
      ),
    ).toEqual({ ...idle, activeItem: "a" });
  });

  it("forgets the Segment once it has focus", () => {
    expect(
      reduceSession(
        { ...idle, focus: { item: "a", part: "value" } },
        { type: "focused" },
      ).focus,
    ).toBeNull();
  });
});
