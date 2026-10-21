import { describe, expect, it } from "vitest";
import { ROUTE_LENS_META_KEY } from "./constants.js";
import { routeLensFacet } from "./routeLensFacet.js";
import type { LensEntry } from "./types.js";

const Icon = () => null;

const entry: LensEntry = {
  label: "Definitions",
  icon: Icon,
  order: 3,
  tier: 1,
};

/** Read a `meta` bag carrying `value` under the lens key. */
const readLens = (value: unknown) =>
  routeLensFacet.read({ [ROUTE_LENS_META_KEY]: value });

describe("routeLensFacet", () => {
  describe("read", () => {
    it("returns undefined when the route declares no lens", () => {
      expect(routeLensFacet.read(undefined)).toBeUndefined();
      expect(routeLensFacet.read({ shortcut: "3" })).toBeUndefined();
    });

    it("returns a well-formed declaration by identity", () => {
      expect(readLens(entry)).toBe(entry);
    });

    it("throws when the declaration is not an object", () => {
      expect(() => readLens("Definitions")).toThrow(
        "route meta lens is not an object",
      );
      expect(() => readLens(null)).toThrow("route meta lens is not an object");
    });

    it("throws when the label is not a non-empty string", () => {
      expect(() => readLens({ ...entry, label: "" })).toThrow(
        "route meta lens.label is not a non-empty string",
      );
    });

    it("throws when the icon is not a component", () => {
      expect(() => readLens({ ...entry, icon: "definitions" })).toThrow(
        "route meta lens.icon is not a component",
      );
    });

    it("throws when the order is not a finite integer", () => {
      expect(() => readLens({ ...entry, order: 2.5 })).toThrow(
        "route meta lens.order is not a finite integer",
      );
      expect(() => readLens({ ...entry, order: Number.NaN })).toThrow(
        "route meta lens.order is not a finite integer",
      );
    });

    it("throws when the tier is not 1 or 2", () => {
      expect(() => readLens({ ...entry, tier: 3 })).toThrow(
        "route meta lens.tier is not 1 or 2",
      );
    });
  });

  describe("of", () => {
    it("authors a declaration under the key it reads", () => {
      expect(routeLensFacet.of(entry)).toEqual({
        [ROUTE_LENS_META_KEY]: entry,
      });
    });
  });
});
