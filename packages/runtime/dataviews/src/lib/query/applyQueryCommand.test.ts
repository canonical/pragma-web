import { describe, expect, it } from "vitest";
import applyQueryCommand from "./applyQueryCommand.js";
import { DEFAULT_WINDOW } from "./constants.js";
import type { Predicate, ResultWindow, Slice } from "./types.js";

const buildSlice = (overrides: Partial<Slice> = {}): Slice => ({
  filter: [],
  search: null,
  sort: [],
  group: [],
  ...overrides,
});

const buildWindow = (overrides: Partial<ResultWindow> = {}): ResultWindow => ({
  ...DEFAULT_WINDOW,
  ...overrides,
});

describe("applyQueryCommand", () => {
  it("replaces only the addressed predicate and preserves other clauses", () => {
    const base = buildSlice({
      filter: [
        { field: "status", operator: "isAny", operands: ["failed"] },
        { field: "zone", operator: "isAny", operands: ["north"] },
      ],
      sort: [{ field: "name", direction: "asc" }],
    });
    const result = applyQueryCommand(base, buildWindow(), {
      kind: "setPredicate",
      predicate: {
        field: "status",
        operator: "isAny",
        operands: ["cancelled"],
      },
    });
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.slice.filter).toEqual([
      { field: "zone", operator: "isAny", operands: ["north"] },
      { field: "status", operator: "isAny", operands: ["cancelled"] },
    ]);
    expect(result.slice.sort).toEqual(base.sort);
    expect(result.sliceChanged).toBe(true);
  });

  it("appends a predicate for an unaddressed field", () => {
    const result = applyQueryCommand(buildSlice(), buildWindow(), {
      kind: "setPredicate",
      predicate: { field: "status", operator: "isAny", operands: ["failed"] },
    });
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.slice.filter).toHaveLength(1);
  });

  it("accepts bound and zero-value predicates with their exact arities", () => {
    for (const predicate of [
      { field: "updated", operator: "gte", operands: ["2026-01-01"] },
      { field: "updated", operator: "lte", operands: ["2026-12-31"] },
      { field: "owner", operator: "isSet", operands: [] },
    ] as const) {
      const result = applyQueryCommand(buildSlice(), buildWindow(), {
        kind: "setPredicate",
        predicate,
      });
      expect(result.status).toBe("accepted");
    }
  });

  it("resets the page and clears the cursor on a slice change", () => {
    const result = applyQueryCommand(
      buildSlice(),
      buildWindow({ page: 4, cursor: "page-four" }),
      {
        kind: "setPredicate",
        predicate: { field: "status", operator: "isAny", operands: ["failed"] },
      },
    );
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.window.page).toBe(1);
    expect(result.window.cursor).toBeNull();
    expect(result.windowChanged).toBe(true);
  });

  it("clears a cursor a slice change left addressing nothing", () => {
    // Already on page one, so the token alone is what moves: a token minted
    // for one result set does not address a start in another.
    const result = applyQueryCommand(
      buildSlice(),
      buildWindow({ cursor: "minted" }),
      {
        kind: "setSearch",
        search: "yak",
      },
    );
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.window.cursor).toBeNull();
    expect(result.windowChanged).toBe(true);
  });

  it("keeps the collapsed groups across a slice change", () => {
    // A collapsed group is still that group after a filter.
    const result = applyQueryCommand(
      buildSlice({ group: [{ field: "status" }] }),
      buildWindow({ collapsed: [["failed"]] }),
      { kind: "setSearch", search: "yak" },
    );
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.window.collapsed).toEqual([["failed"]]);
    // Nothing about the window moved, so it reports no window change.
    expect(result.windowChanged).toBe(false);
    expect(result.sliceChanged).toBe(true);
  });

  it("removes exactly the addressed predicate and resets the window", () => {
    const base = buildSlice({
      filter: [
        { field: "status", operator: "isAny", operands: ["failed"] },
        { field: "status", operator: "isSet", operands: [] },
      ],
    });
    const result = applyQueryCommand(base, buildWindow({ page: 3 }), {
      kind: "removePredicate",
      field: "status",
      operator: "isAny",
    });
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.slice.filter).toEqual([
      { field: "status", operator: "isSet", operands: [] },
    ]);
    expect(result.window.page).toBe(1);
  });

  it("reports no change when removing an absent predicate", () => {
    const base = buildSlice({
      filter: [{ field: "zone", operator: "isAny", operands: ["north"] }],
    });
    const result = applyQueryCommand(base, buildWindow({ page: 2 }), {
      kind: "removePredicate",
      field: "status",
      operator: "isAny",
    });
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.sliceChanged).toBe(false);
    expect(result.window.page).toBe(2);
    expect(result.windowChanged).toBe(false);
  });

  it("treats an empty search replacement as clearing the search", () => {
    const result = applyQueryCommand(
      buildSlice({ search: "yak" }),
      buildWindow({ page: 2 }),
      { kind: "setSearch", search: "" },
    );
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.slice.search).toBeNull();
    expect(result.sliceChanged).toBe(true);
    expect(result.window.page).toBe(1);
  });

  it("replaces the complete sort and resets the window", () => {
    const base = buildSlice({ sort: [{ field: "name", direction: "asc" }] });
    const result = applyQueryCommand(base, buildWindow({ page: 2 }), {
      kind: "setSort",
      sort: [
        { field: "updated", direction: "desc" },
        { field: "name", direction: "asc" },
      ],
    });
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.slice.sort).toEqual([
      { field: "updated", direction: "desc" },
      { field: "name", direction: "asc" },
    ]);
    expect(result.window.page).toBe(1);
  });

  it("stores a sort field spelled twice as its first term", () => {
    const base = buildSlice({ sort: [{ field: "name", direction: "asc" }] });
    const result = applyQueryCommand(base, buildWindow(), {
      kind: "setSort",
      sort: [
        { field: "name", direction: "asc" },
        { field: "updated", direction: "desc" },
        { field: "name", direction: "desc" },
      ],
    });
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.slice.sort).toEqual([
      { field: "name", direction: "asc" },
      { field: "updated", direction: "desc" },
    ]);
  });

  it("clears the sort through an empty replacement", () => {
    const base = buildSlice({ sort: [{ field: "name", direction: "asc" }] });
    const result = applyQueryCommand(base, buildWindow(), {
      kind: "setSort",
      sort: [],
    });
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.slice.sort).toEqual([]);
    expect(result.sliceChanged).toBe(true);
  });

  it("sets ordered grouping levels and clears them again", () => {
    const grouped = applyQueryCommand(buildSlice(), buildWindow({ page: 2 }), {
      kind: "setGroup",
      group: [{ field: "zone" }, { field: "status" }],
    });
    if (grouped.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(grouped.slice.group).toEqual([
      { field: "zone" },
      { field: "status" },
    ]);
    expect(grouped.window.page).toBe(1);

    const cleared = applyQueryCommand(grouped.slice, buildWindow(), {
      kind: "setGroup",
      group: [],
    });
    if (cleared.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(cleared.slice.group).toEqual([]);
    expect(cleared.sliceChanged).toBe(true);
  });

  it("rebuilds the grouping levels rather than keeping the caller's", () => {
    const levels = [{ field: "zone" }];
    const result = applyQueryCommand(buildSlice(), buildWindow(), {
      kind: "setGroup",
      group: levels,
    });
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.slice.group.at(0)).not.toBe(levels.at(0));
  });

  it("keeps a reordering of the same grouping fields as a change", () => {
    const base = buildSlice({
      group: [{ field: "zone" }, { field: "status" }],
    });
    const result = applyQueryCommand(base, buildWindow(), {
      kind: "setGroup",
      group: [{ field: "status" }, { field: "zone" }],
    });
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.sliceChanged).toBe(true);
  });

  it("clears the collapsed groups when the grouping changes", () => {
    // Grouping decides what a collapsed path names, so a new grouping leaves
    // no path that still means what it meant.
    const result = applyQueryCommand(
      buildSlice({ group: [{ field: "status" }] }),
      buildWindow({ collapsed: [["failed"]] }),
      { kind: "setGroup", group: [{ field: "zone" }] },
    );
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.window.collapsed).toEqual([]);
    expect(result.windowChanged).toBe(true);
  });

  it("rejects a grouping level naming no field", () => {
    const result = applyQueryCommand(buildSlice(), buildWindow(), {
      kind: "setGroup",
      group: [{ field: "zone" }, { field: "" }],
    });
    if (result.status !== "rejected") {
      throw new Error("expected rejection");
    }
    expect(result.reason).toBe("group term field must not be empty");
  });

  it("collapses groups from the first page, leaving the query alone", () => {
    const base = buildSlice({ group: [{ field: "status" }] });
    const result = applyQueryCommand(
      base,
      buildWindow({ page: 3, cursor: "page-three" }),
      { kind: "setCollapsed", collapsed: [["failed"], ["ready"]] },
    );
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.slice).toBe(base);
    // Collapse changes which rows the pages hold, exactly as a filter does.
    expect(result.window.page).toBe(1);
    expect(result.window.cursor).toBeNull();
    expect(result.window.collapsed).toEqual([["failed"], ["ready"]]);
    expect(result.sliceChanged).toBe(false);
    expect(result.windowChanged).toBe(true);
  });

  it("copies the collapsed paths it is given", () => {
    const paths = [["failed"]];
    const result = applyQueryCommand(buildSlice(), buildWindow(), {
      kind: "setCollapsed",
      collapsed: paths,
    });
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.window.collapsed.at(0)).not.toBe(paths.at(0));
  });

  it("changes nothing when the collapse is restated", () => {
    const base = buildWindow({
      page: 3,
      collapsed: [["failed"], ["eu", "west"]],
    });
    const result = applyQueryCommand(buildSlice(), base, {
      kind: "setCollapsed",
      collapsed: [["failed"], ["eu", "west"]],
    });
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.window).toBe(base);
    expect(result.windowChanged).toBe(false);
  });

  it("tells collapses apart by count, by depth and by key", () => {
    const applyCollapsed = (collapsed: readonly (readonly string[])[]) =>
      applyQueryCommand(
        buildSlice(),
        buildWindow({ collapsed: [["eu", "west"]] }),
        {
          kind: "setCollapsed",
          collapsed,
        },
      );
    for (const collapsed of [
      [["eu", "west"], ["failed"]],
      [["eu"]],
      [["eu", "east"]],
    ]) {
      const result = applyCollapsed(collapsed);
      if (result.status !== "accepted") {
        throw new Error("expected acceptance");
      }
      expect(result.windowChanged).toBe(true);
    }
  });

  it("navigates the window without touching the query", () => {
    const base = buildSlice({ search: "yak" });
    const result = applyQueryCommand(base, buildWindow(), {
      kind: "navigateWindow",
      page: 2,
      size: 25,
    });
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.slice).toBe(base);
    expect(result.window).toEqual({
      page: 2,
      size: 25,
      cursor: null,
      collapsed: [],
    });
    expect(result.sliceChanged).toBe(false);
    expect(result.windowChanged).toBe(true);
  });

  it("takes the current value for a window member it is not given", () => {
    const result = applyQueryCommand(
      buildSlice(),
      buildWindow({ page: 4, size: 25 }),
      {
        kind: "navigateWindow",
        page: 5,
      },
    );
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.window.size).toBe(25);
    const resized = applyQueryCommand(
      buildSlice(),
      buildWindow({ page: 4, size: 25 }),
      {
        kind: "navigateWindow",
        size: 10,
      },
    );
    if (resized.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(resized.window.page).toBe(4);
  });

  it("reports no change when navigating to the current window", () => {
    const result = applyQueryCommand(
      buildSlice(),
      buildWindow({ page: 2, size: 25 }),
      {
        kind: "navigateWindow",
        page: 2,
        size: 25,
      },
    );
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.windowChanged).toBe(false);
  });

  it("reaches a page by the token the source handed back", () => {
    const result = applyQueryCommand(buildSlice(), buildWindow({ page: 1 }), {
      kind: "navigateWindow",
      page: 2,
      cursor: "after-page-one",
    });
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.window.cursor).toBe("after-page-one");
    expect(result.windowChanged).toBe(true);
  });

  it("keeps the token when neither the page nor the size moves", () => {
    const result = applyQueryCommand(
      buildSlice(),
      buildWindow({ page: 2, cursor: "page-two" }),
      { kind: "navigateWindow", page: 2 },
    );
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.window.cursor).toBe("page-two");
    expect(result.windowChanged).toBe(false);
  });

  it("clears the token when the page or the size moves without one", () => {
    // A token addresses one page start, so moving without supplying one
    // leaves no token behind to describe the page that was left.
    const paged = applyQueryCommand(
      buildSlice(),
      buildWindow({ page: 2, cursor: "page-two" }),
      { kind: "navigateWindow", page: 3 },
    );
    if (paged.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(paged.window.cursor).toBeNull();

    const resized = applyQueryCommand(
      buildSlice(),
      buildWindow({ page: 2, cursor: "page-two" }),
      { kind: "navigateWindow", size: 10 },
    );
    if (resized.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(resized.window.cursor).toBeNull();
  });

  it("drops a token on the spot when asked for null", () => {
    const result = applyQueryCommand(
      buildSlice(),
      buildWindow({ page: 2, cursor: "page-two" }),
      { kind: "navigateWindow", cursor: null },
    );
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.window.cursor).toBeNull();
    expect(result.window.page).toBe(2);
    expect(result.windowChanged).toBe(true);
  });

  it("rejects an empty cursor rather than reading it as no cursor", () => {
    const result = applyQueryCommand(buildSlice(), buildWindow(), {
      kind: "navigateWindow",
      cursor: "",
    });
    if (result.status !== "rejected") {
      throw new Error("expected rejection");
    }
    expect(result.reason).toBe(
      "cursor must not be empty; use null to clear it",
    );
  });

  it("leaves the collapsed groups alone while navigating", () => {
    const result = applyQueryCommand(
      buildSlice(),
      buildWindow({ collapsed: [["failed"]] }),
      { kind: "navigateWindow", page: 2 },
    );
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.window.collapsed).toEqual([["failed"]]);
  });

  it("treats a semantically unchanged edit as no change at all", () => {
    const base = buildSlice({
      filter: [
        {
          field: "status",
          operator: "isAny",
          operands: ["failed", "cancelled"],
        },
      ],
      sort: [{ field: "name", direction: "asc" }],
    });
    const result = applyQueryCommand(base, buildWindow({ page: 2 }), {
      kind: "setPredicate",
      predicate: {
        field: "status",
        operator: "isAny",
        operands: ["cancelled", "failed"],
      },
    });
    if (result.status !== "accepted") {
      throw new Error("expected acceptance");
    }
    expect(result.sliceChanged).toBe(false);
    expect(result.windowChanged).toBe(false);
    expect(result.window.page).toBe(2);
  });

  it("rejects a predicate with an empty field", () => {
    const result = applyQueryCommand(buildSlice(), buildWindow(), {
      kind: "setPredicate",
      predicate: { field: "", operator: "isAny", operands: ["failed"] },
    });
    expect(result.status).toBe("rejected");
  });

  it("rejects non-positive or fractional window values", () => {
    for (const command of [
      { kind: "navigateWindow", page: 0 },
      { kind: "navigateWindow", page: -1 },
      { kind: "navigateWindow", page: 1.5 },
      { kind: "navigateWindow", page: Number.NaN },
      { kind: "navigateWindow", size: 0 },
      { kind: "navigateWindow", size: -3 },
      { kind: "navigateWindow", size: 2.5 },
      { kind: "navigateWindow", size: Number.POSITIVE_INFINITY },
    ] as const) {
      const result = applyQueryCommand(buildSlice(), buildWindow(), command);
      expect(result.status).toBe("rejected");
    }
  });

  it("rejects predicates that violate the bounded grammar", () => {
    const cases = [
      {
        kind: "setPredicate",
        predicate: { field: "status", operator: "isAny", operands: [] },
      },
      {
        kind: "setPredicate",
        predicate: { field: "cpu", operator: "gte", operands: [1, 2] },
      },
      {
        kind: "setPredicate",
        predicate: { field: "cpu", operator: "gte", operands: [] },
      },
      {
        kind: "setPredicate",
        predicate: { field: "owner", operator: "isSet", operands: ["x"] },
      },
      {
        kind: "setPredicate",
        predicate: { field: "name", operator: "contains", operands: [] },
      },
      {
        kind: "setPredicate",
        predicate: {
          field: "name",
          operator: "contains",
          operands: ["a", "b"],
        },
      },
      {
        kind: "setPredicate",
        predicate: { field: "cpu", operator: "gte", operands: [Number.NaN] },
      },
      {
        kind: "setPredicate",
        predicate: {
          field: "cpu",
          operator: "lte",
          operands: [Number.POSITIVE_INFINITY],
        },
      },
      {
        kind: "setSort",
        sort: [{ field: "", direction: "asc" }],
      },
    ] as const;
    for (const command of cases) {
      const result = applyQueryCommand(buildSlice(), buildWindow(), command);
      expect(result.status).toBe("rejected");
    }
  });

  it("rejects predicate fields containing NUL characters on creation only", () => {
    const result = applyQueryCommand(buildSlice(), buildWindow(), {
      kind: "setPredicate",
      predicate: { field: "a\u0000b", operator: "isAny", operands: ["x"] },
    });
    expect(result.status).toBe("rejected");
    // Removal may address out-of-grammar predicates to clean them up.
    const removal = applyQueryCommand(buildSlice(), buildWindow(), {
      kind: "removePredicate",
      field: "a\u0000b",
      operator: "isAny",
    });
    expect(removal.status).toBe("accepted");
  });

  it("rejects a predicate with an unknown operator without losing the reason", () => {
    const forged = {
      kind: "setPredicate",
      predicate: { field: "status", operator: "like", operands: ["x"] },
    } as unknown as { kind: "setPredicate"; predicate: Predicate };
    const result = applyQueryCommand(buildSlice(), buildWindow(), forged);
    if (result.status !== "rejected") {
      throw new Error("expected rejection");
    }
    expect(result.reason).toBe("unknown predicate operator like");
  });

  it("keeps state unchanged on rejection", () => {
    const base = buildSlice({ search: "yak" });
    const result = applyQueryCommand(base, buildWindow({ page: 2 }), {
      kind: "navigateWindow",
      page: 0,
    });
    if (result.status !== "rejected") {
      throw new Error("expected rejection");
    }
    expect(result.slice).toBe(base);
    expect(result.window.page).toBe(2);
    expect(result.reason).toBe("page must be a positive integer");
  });

  it("moves a set to the other operator on its field in one transition", () => {
    const standing = buildSlice({
      filter: [
        { field: "status", operator: "isAny", operands: ["failed"] },
        { field: "cpu", operator: "gte", operands: [4] },
      ],
    });
    const result = applyQueryCommand(standing, buildWindow(), {
      kind: "editPredicates",
      remove: [{ field: "status", operator: "isAny", nth: 0 }],
      add: [{ field: "status", operator: "isNone", operands: ["failed"] }],
    });
    expect(result.status).toBe("accepted");
    expect(result.slice.filter).toEqual([
      { field: "cpu", operator: "gte", operands: [4] },
      { field: "status", operator: "isNone", operands: ["failed"] },
    ]);
  });

  describe("one conjunct among several at an address", () => {
    const buildGte = (cores: number): Predicate => ({
      field: "cpu",
      operator: "gte",
      operands: [cores],
    });
    const bounded = buildSlice({
      filter: [buildGte(8), buildGte(4), buildGte(16)],
    });

    const accept = (result: ReturnType<typeof applyQueryCommand>) => {
      if (result.status !== "accepted") {
        throw new Error(`expected acceptance, not ${result.reason}`);
      }
      return result;
    };

    // Canonical order compares operands by their text: 16, then 4, then 8.
    it("replaces the conjunct at nth, counted in canonical order", () => {
      const result = accept(
        applyQueryCommand(bounded, buildWindow(), {
          kind: "setPredicate",
          predicate: buildGte(2),
          nth: 1,
        }),
      );
      expect(result.slice.filter).toEqual([
        buildGte(8),
        buildGte(16),
        buildGte(2),
      ]);
    });

    it("replaces conjunct 0 when no place is given", () => {
      expect(
        accept(
          applyQueryCommand(bounded, buildWindow(), {
            kind: "setPredicate",
            predicate: buildGte(2),
          }),
        ).slice.filter,
      ).toEqual([buildGte(8), buildGte(4), buildGte(2)]);
    });

    it("rejects a place past the conjuncts present, or no whole number", () => {
      for (const nth of [3, -1, 1.5, Number.NaN]) {
        const result = applyQueryCommand(bounded, buildWindow(), {
          kind: "setPredicate",
          predicate: buildGte(2),
          nth,
        });
        expect(result.status).toBe("rejected");
        expect(result.slice).toBe(bounded);
      }
      expect(
        applyQueryCommand(buildSlice(), buildWindow(), {
          kind: "setPredicate",
          predicate: buildGte(2),
          nth: 1,
        }),
      ).toMatchObject({
        status: "rejected",
        reason: "cpu gte holds no conjunct 1",
      });
    });

    it("removes the conjunct at nth alone, and nothing for one already gone", () => {
      expect(
        accept(
          applyQueryCommand(bounded, buildWindow(), {
            kind: "removePredicate",
            field: "cpu",
            operator: "gte",
            nth: 2,
          }),
        ).slice.filter,
      ).toEqual([buildGte(4), buildGte(16)]);
      expect(
        accept(
          applyQueryCommand(bounded, buildWindow({ page: 2 }), {
            kind: "removePredicate",
            field: "cpu",
            operator: "gte",
            nth: 3,
          }),
        ),
      ).toMatchObject({ sliceChanged: false, windowChanged: false });
      expect(
        applyQueryCommand(bounded, buildWindow(), {
          kind: "removePredicate",
          field: "cpu",
          operator: "gte",
          nth: -1,
        }).status,
      ).toBe("rejected");
    });

    it("removes every copy of a conjunct the slice spells twice", () => {
      expect(
        accept(
          applyQueryCommand(
            buildSlice({ filter: [buildGte(4), buildGte(4)] }),
            buildWindow(),
            {
              kind: "removePredicate",
              field: "cpu",
              operator: "gte",
            },
          ),
        ).slice.filter,
      ).toEqual([]);
    });

    it("edits by refs read before the edit, in one transition", () => {
      const result = accept(
        applyQueryCommand(bounded, buildWindow({ page: 3 }), {
          kind: "editPredicates",
          remove: [
            { field: "cpu", operator: "gte", nth: 0 },
            { field: "cpu", operator: "gte", nth: 1 },
          ],
          add: [{ field: "cpu", operator: "lte", operands: [32] }],
        }),
      );
      expect(result.slice.filter).toEqual([
        buildGte(8),
        { field: "cpu", operator: "lte", operands: [32] },
      ]);
      expect(result.window.page).toBe(1);
    });

    it("accepts an empty edit as no change", () => {
      expect(
        accept(
          applyQueryCommand(bounded, buildWindow(), {
            kind: "editPredicates",
            remove: [],
            add: [],
          }),
        ),
      ).toMatchObject({ sliceChanged: false, windowChanged: false });
    });

    it("rejects an edit naming a conjunct twice, or one the slice lacks", () => {
      const twice = applyQueryCommand(bounded, buildWindow(), {
        kind: "editPredicates",
        remove: [
          { field: "cpu", operator: "gte", nth: 1 },
          { field: "cpu", operator: "gte", nth: 1 },
        ],
        add: [],
      });
      expect(twice).toMatchObject({
        status: "rejected",
        reason: "conjunct 1 of cpu gte is named twice",
      });
      expect(
        applyQueryCommand(bounded, buildWindow(), {
          kind: "editPredicates",
          remove: [{ field: "cpu", operator: "lte", nth: 0 }],
          add: [],
        }),
      ).toMatchObject({
        status: "rejected",
        reason: "cpu lte holds no conjunct 0",
      });
      expect(
        applyQueryCommand(bounded, buildWindow(), {
          kind: "editPredicates",
          remove: [{ field: "cpu", operator: "gte", nth: 0.5 }],
          add: [],
        }).status,
      ).toBe("rejected");
    });

    it("rejects an edit adding a conjunct outside the grammar", () => {
      expect(
        applyQueryCommand(bounded, buildWindow(), {
          kind: "editPredicates",
          remove: [],
          add: [{ field: "cpu", operator: "gte", operands: [] }],
        }),
      ).toMatchObject({
        status: "rejected",
        reason: "gte predicate needs exactly one operand",
      });
    });
  });

  describe("clearing parts of the query", () => {
    const busy = buildSlice({
      filter: [
        { field: "tags", operator: "isAny", operands: ["ex-gpu"] },
        { field: "tags", operator: "isAny", operands: ["ex-nvme"] },
      ],
      search: "alder",
      sort: [{ field: "name", direction: "asc" }],
    });
    const deep = buildWindow({
      page: 3,
      cursor: "ex-token",
      collapsed: [["a"]],
    });

    it("empties the filter, the search, or both, and keeps the rest", () => {
      expect(
        applyQueryCommand(busy, deep, { kind: "clear", paths: ["filter"] }),
      ).toMatchObject({
        status: "accepted",
        slice: { ...busy, filter: [] },
        sliceChanged: true,
      });
      expect(
        applyQueryCommand(busy, deep, { kind: "clear", paths: ["search"] }),
      ).toMatchObject({ slice: { ...busy, search: null } });
      expect(
        applyQueryCommand(busy, deep, {
          kind: "clear",
          paths: ["filter", "search"],
        }),
      ).toMatchObject({ slice: { ...busy, filter: [], search: null } });
    });

    it("returns to the first page and keeps the collapsed groups", () => {
      expect(
        applyQueryCommand(busy, deep, { kind: "clear", paths: ["filter"] }),
      ).toMatchObject({
        window: { page: 1, cursor: null, collapsed: [["a"]] },
        windowChanged: true,
      });
    });

    it("reads repeated or reordered parts as the same clear", () => {
      const once = applyQueryCommand(busy, deep, {
        kind: "clear",
        paths: ["filter", "search"],
      });
      expect(
        applyQueryCommand(busy, deep, {
          kind: "clear",
          paths: ["search", "filter", "search"],
        }),
      ).toEqual(once);
    });

    it("changes nothing when the parts are already empty", () => {
      expect(
        applyQueryCommand(buildSlice(), deep, {
          kind: "clear",
          paths: ["filter", "search"],
        }),
      ).toEqual({
        status: "accepted",
        slice: buildSlice(),
        window: deep,
        sliceChanged: false,
        windowChanged: false,
      });
    });

    it("rejects a clear naming no part, or one the query has not", () => {
      expect(
        applyQueryCommand(busy, deep, {
          kind: "clear",
          paths: [] as unknown as ["filter"],
        }),
      ).toMatchObject({
        status: "rejected",
        reason: "a clear must name at least one part of the query",
      });
      expect(
        applyQueryCommand(busy, deep, {
          kind: "clear",
          paths: ["filter", "sort"] as unknown as ["filter"],
        }),
      ).toMatchObject({
        status: "rejected",
        reason: "a clear cannot empty sort, only filter or search",
      });
    });
  });
});
