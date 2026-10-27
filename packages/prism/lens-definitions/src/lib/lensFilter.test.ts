/**
 * The lens filter vocabulary's contracts. These pin the two properties the
 * whole explorer rests on: the DEFAULT is a no-op (the SSR determinism
 * rule — a non-no-op default would change first paint and break
 * hydration), and text never reaches the chip predicate (the search box
 * governs the rail, the chips govern the graph).
 */

import { describe, expect, it } from "vitest";
import createAllNamespacesFilter from "../../testing/createAllNamespacesFilter.js";
import { ABSTRACTION_VALUES, DEFAULT_LENS_FILTER } from "./constants.js";
import {
  classifyAbstraction,
  matchesChips,
  matchesDimming,
  matchesText,
  normalizeFilterText,
  resolveFilter,
  toggleIn,
} from "./lensFilter.js";

describe("the default filter is a no-op (the SSR determinism keystone)", () => {
  it("matches every term's text", () => {
    expect(
      matchesText(DEFAULT_LENS_FILTER.text, "UI Block", "ds:UIBlock"),
    ).toBe(true);
    expect(matchesText(DEFAULT_LENS_FILTER.text, null, "anything:at-all")).toBe(
      true,
    );
  });

  it("allows both abstraction values, so no class is dimmed on that axis", () => {
    expect([...DEFAULT_LENS_FILTER.abstractions]).toEqual([
      ...ABSTRACTION_VALUES,
    ]);
  });

  it("carries no text — nothing typed, nothing seeded", () => {
    // If this ever becomes non-empty (a query-string or localStorage seed),
    // the server's markup and the client's first paint diverge.
    expect(DEFAULT_LENS_FILTER.text).toBe("");
  });
});

describe("matchesText", () => {
  it("matches case-insensitively over the label", () => {
    expect(matchesText("ui bl", "UI Block", "ds:UIBlock")).toBe(true);
  });

  it("matches over the prefixed uri too", () => {
    expect(matchesText("uiblock", "UI Block", "ds:UIBlock")).toBe(true);
    expect(matchesText("ds:", "UI Block", "ds:UIBlock")).toBe(true);
  });

  it("falls back to the prefixed uri when a term has no label", () => {
    expect(matchesText("uiblock", null, "ds:UIBlock")).toBe(true);
  });

  it("rejects a non-substring", () => {
    expect(matchesText("zzz", "UI Block", "ds:UIBlock")).toBe(false);
  });
});

describe("matchesChips — text never reaches the graph", () => {
  it("ignores the text axis entirely", () => {
    // A filter whose text matches NOTHING still passes the chip predicate:
    // the search box dims the rail, never the graph.
    const filter = {
      ...createAllNamespacesFilter(["ds"]),
      text: "no-such-term-anywhere",
    };
    expect(matchesChips(filter, false, "ds")).toBe(true);
  });

  it("dims a class whose namespace chip is off", () => {
    expect(matchesChips(createAllNamespacesFilter(["ds"]), false, "cs")).toBe(
      false,
    );
  });

  it("dims a class whose abstraction chip is off", () => {
    const concreteOnly = {
      ...createAllNamespacesFilter(["ds"]),
      abstractions: ["concrete"] as const,
    };
    expect(matchesChips(concreteOnly, true, "ds")).toBe(false);
    expect(matchesChips(concreteOnly, false, "ds")).toBe(true);
  });

  it("dims everything on an axis whose allow-list is empty", () => {
    const nothingLit = {
      ...createAllNamespacesFilter([]),
      abstractions: [],
    } as const;
    expect(matchesChips(nothingLit, true, "ds")).toBe(false);
    expect(matchesChips(nothingLit, false, "ds")).toBe(false);
  });
});

describe("resolveFilter", () => {
  const prefixes = ["ds", "cs"] as const;

  it("lights every ontology on an untouched filter, with the caller's own array", () => {
    // The well's memo compares `namespaces` by reference, so the resolved
    // allow-list must BE the caller's array, never a copy of it.
    expect(resolveFilter(DEFAULT_LENS_FILTER, prefixes).namespaces).toBe(
      prefixes,
    );
  });

  it("keeps a pressed allow-list as the reader left it, by reference", () => {
    const pressed = ["cs"] as const;
    const filter = { ...DEFAULT_LENS_FILTER, namespaces: pressed };
    expect(resolveFilter(filter, prefixes).namespaces).toBe(pressed);
  });

  it("keeps an EMPTY allow-list empty: every ontology turned off", () => {
    const filter = { ...DEFAULT_LENS_FILTER, namespaces: [] };
    expect(resolveFilter(filter, prefixes).namespaces).toEqual([]);
  });

  it("carries the other axes through untouched", () => {
    const filter = {
      ...DEFAULT_LENS_FILTER,
      text: "block",
      abstractions: ["concrete"] as const,
    };
    expect(resolveFilter(filter, prefixes)).toEqual({
      text: "block",
      abstractions: ["concrete"],
      namespaces: prefixes,
      withInstances: false,
    });
  });
});

describe("matchesDimming", () => {
  it("dims on the search text alone while the instances axis is off", () => {
    const filter = createAllNamespacesFilter(["ds"]);
    expect(matchesDimming(filter, "UI Block", "ds:UIBlock", 0)).toBe(true);
    const searching = { ...filter, text: "chip" };
    expect(matchesDimming(searching, "UI Block", "ds:UIBlock", 3)).toBe(false);
  });

  it("dims a class without instances while the instances axis is on", () => {
    const withInstances = {
      ...createAllNamespacesFilter(["ds"]),
      withInstances: true,
    };
    expect(matchesDimming(withInstances, "UI Block", "ds:UIBlock", 0)).toBe(
      false,
    );
    expect(matchesDimming(withInstances, "Component", "ds:Component", 12)).toBe(
      true,
    );
  });
});

describe("classifyAbstraction", () => {
  it("is total over isAbstract", () => {
    expect(classifyAbstraction(true)).toBe("abstract");
    expect(classifyAbstraction(false)).toBe("concrete");
  });
});

describe("normalizeFilterText", () => {
  it("trims and lower-cases", () => {
    expect(normalizeFilterText("  UI Block  ")).toBe("ui block");
  });
});

describe("toggleIn", () => {
  const ordered = ["ds", "cs", "anatomy"] as const;

  it("removes a lit value", () => {
    expect([...toggleIn(["ds", "cs"], ordered, "ds")]).toEqual(["cs"]);
  });

  it("adds an unlit value back in CANONICAL order, not append order", () => {
    // Order stability matters: the chips render from this list, and a
    // re-ordering toggle would make them jump around under the cursor.
    expect([...toggleIn(["anatomy"], ordered, "ds")]).toEqual([
      "ds",
      "anatomy",
    ]);
  });

  it("round-trips to the original set", () => {
    const once = toggleIn(ordered, ordered, "cs");
    const twice = toggleIn(once, ordered, "cs");
    expect([...twice]).toEqual([...ordered]);
  });
});
