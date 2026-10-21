import { route } from "@canonical/router-core";
import { describe, expect, it } from "vitest";
import { LENS_ROUTES } from "../../../testing/fixtures.js";
import collectShortcuts from "./collectShortcuts.js";
import { ROUTE_SHORTCUT_META_KEY } from "./constants.js";
import routeShortcutFacet from "./routeShortcutFacet.js";

const page = () => null;

describe("collectShortcuts", () => {
  it("builds both lookups over the routes that claim a key", () => {
    const routes = {
      home: route({
        url: "/",
        content: page,
        meta: routeShortcutFacet.of("1"),
      }),
      quiet: route({ url: "/quiet", content: page }),
      docs: route({
        url: "/docs",
        content: page,
        meta: routeShortcutFacet.of("2"),
      }),
    } as const;
    const { byKey, byRoute } = collectShortcuts(routes);
    expect(Object.fromEntries(byKey)).toEqual({ "1": "home", "2": "docs" });
    expect(Object.fromEntries(byRoute)).toEqual({ home: "1", docs: "2" });
  });

  it("returns empty maps when no route claims a key", () => {
    const routes = {
      quiet: route({ url: "/quiet", content: page }),
    } as const;
    const { byKey, byRoute } = collectShortcuts(routes);
    expect(byKey.size).toBe(0);
    expect(byRoute.size).toBe(0);
  });

  it("throws when two routes claim the same key — the defect this closes", () => {
    // A union type rejected an INVALID key and accepted a DUPLICATE one:
    // this compiled, `.find()` resolved it first-wins, and the rail rendered
    // the digit twice. Now it is a failure, and it names both claimants.
    const routes = {
      definitions: route({
        url: "/definitions",
        content: page,
        meta: routeShortcutFacet.of("3"),
      }),
      dictionary: route({
        url: "/dictionary",
        content: page,
        meta: routeShortcutFacet.of("3"),
      }),
    } as const;
    expect(() => collectShortcuts(routes)).toThrow(/claimed by both/);
    expect(() => collectShortcuts(routes)).toThrow(/definitions/);
    expect(() => collectShortcuts(routes)).toThrow(/dictionary/);
  });

  it("throws when a parameterised route claims a key", () => {
    // `navigate(name)` cannot supply the params a keystroke does not have.
    const routes = {
      term: route({
        url: "/definitions/:term",
        content: page,
        meta: routeShortcutFacet.of("3"),
      }),
    } as const;
    expect(() => collectShortcuts(routes)).toThrow(
      /cannot carry a bare shortcut/,
    );
  });

  it("throws on a malformed claim — not a single character", () => {
    const numeric = {
      home: route({
        url: "/",
        content: page,
        meta: { [ROUTE_SHORTCUT_META_KEY]: 3 },
      }),
    } as const;
    const multiple = {
      home: route({
        url: "/",
        content: page,
        meta: { [ROUTE_SHORTCUT_META_KEY]: "ab" },
      }),
    } as const;
    expect(() => collectShortcuts(numeric)).toThrow(
      /not a single-character key/,
    );
    expect(() => collectShortcuts(multiple)).toThrow(
      /not a single-character key/,
    );
  });

  it("accepts a key above the BMP, one code point in two UTF-16 units", () => {
    // MATHEMATICAL DOUBLE-STRUCK CAPITAL A: `KeyboardEvent.key` reports it
    // as one character, though its `.length` is 2.
    const astral = "\u{1D538}";
    const routes = {
      home: route({
        url: "/",
        content: page,
        meta: { [ROUTE_SHORTCUT_META_KEY]: astral },
      }),
    } as const;
    expect(Object.fromEntries(collectShortcuts(routes).byKey)).toEqual({
      [astral]: "home",
    });
  });

  it("rejects a ZWJ sequence, one grapheme over several code points", () => {
    // WOMAN + ZERO WIDTH JOINER + LAPTOP renders as one glyph, but no
    // keydown reports it as its `key`.
    const routes = {
      home: route({
        url: "/",
        content: page,
        meta: { [ROUTE_SHORTCUT_META_KEY]: "\u{1F469}\u200D\u{1F4BB}" },
      }),
    } as const;
    expect(() => collectShortcuts(routes)).toThrow(
      /not a single-character key/,
    );
  });

  it("collects the fixture table's allocation, skipping the param route", () => {
    expect(Object.fromEntries(collectShortcuts(LENS_ROUTES).byKey)).toEqual({
      "1": "home",
      "2": "catalog",
      "3": "glossary",
    });
  });
});
