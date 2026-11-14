import { describe, expect, it } from "vitest";
import { EX, LENS_OUTLINE, SITE_LENS_FIXTURE } from "../../testing/fixtures.js";
import { indexSiteLens } from "./indexSiteLens.js";
import { selectLiteral } from "./selectLiteral.js";

const index = indexSiteLens(SITE_LENS_FIXTURE, LENS_OUTLINE);

const IDENTITY = { uri: `${EX}identity`, labels: { en: "Identity" }, order: 1 };

describe("indexSiteLens", () => {
  describe("classLens", () => {
    it("answers a class's own facts", () => {
      expect(index.classLens(`${EX}Agent`)).toEqual({
        visibility: "PROMINENT",
        glyph: "shared",
        pluralLabels: { en: "Agents" },
      });
    });

    it("inherits from the nearest declaring level, skipping silent ones", () => {
      expect(index.classLens(`${EX}Employee`)).toEqual({
        visibility: "PROMINENT",
        glyph: "shared",
        pluralLabels: {},
      });
    });

    it("resolves agreeing values at a level and nulls disagreeing ones", () => {
      expect(index.classLens(`${EX}Hub`)).toEqual({
        visibility: null,
        glyph: "shared",
        pluralLabels: {},
      });
    });

    it("never inherits plural labels", () => {
      expect(index.classLens(`${EX}Person`).pluralLabels).toEqual({});
    });

    it("answers nothing for a class without a lens", () => {
      expect(index.classLens(`${EX}Elsewhere`)).toEqual({
        visibility: null,
        glyph: null,
        pluralLabels: {},
      });
    });
  });

  describe("fieldLens", () => {
    it("answers a class's own entry, falling back to the property's visibility", () => {
      expect(index.fieldLens(`${EX}Thing`, `${EX}name`)).toEqual({
        group: IDENTITY,
        order: 1,
        role: "LABEL",
        visibility: "NORMAL",
      });
    });

    it("prefers the entry's visibility to the property's", () => {
      expect(index.fieldLens(`${EX}Thing`, `${EX}code`).visibility).toBe(
        "HIDDEN",
      );
    });

    it("inherits fact by fact, with the diamond rule on each", () => {
      expect(index.fieldLens(`${EX}Hub`, `${EX}name`)).toEqual({
        group: IDENTITY,
        order: 2,
        role: null,
        visibility: "NORMAL",
      });
      expect(index.fieldLens(`${EX}Employee`, `${EX}name`)).toEqual({
        group: IDENTITY,
        order: 2,
        role: "CLASSIFICATION",
        visibility: "NORMAL",
      });
    });

    it("answers a group the lens declares without a label or order", () => {
      expect(index.fieldLens(`${EX}Hub`, `${EX}locatedIn`).group).toEqual({
        uri: `${EX}links`,
      });
    });

    it("answers nothing for a property no entry or lens names", () => {
      expect(index.fieldLens(`${EX}Person`, `${EX}worksFor`)).toEqual({
        group: null,
        order: null,
        role: null,
        visibility: null,
      });
    });
  });

  describe("propertyLens", () => {
    it("answers a property's own facts", () => {
      expect(index.propertyLens(`${EX}name`)).toEqual({
        visibility: "NORMAL",
        pluralLabels: { en: "names" },
        inverseLabels: {},
        inversePluralLabels: {},
        inverseVisibility: null,
      });
    });

    it("falls back to the inverse partner, fact by fact and language by language", () => {
      const worksFor = index.propertyLens(`${EX}worksFor`);
      expect(worksFor.inverseVisibility).toBe("HIDDEN");
      expect(worksFor.inversePluralLabels).toEqual({ en: "employ" });
      expect(selectLiteral(worksFor.inverseLabels, "fr")).toBe("emploie");
      expect(selectLiteral(worksFor.inverseLabels, "EN")).toBe("employs");
      expect(selectLiteral(worksFor.inverseLabels, "de")).toBe(
        "employs (untagged)",
      );
    });

    it("keeps its own inverse facts over the partner's", () => {
      const employs = index.propertyLens(`${EX}employs`);
      expect(employs.inverseVisibility).toBe("PROMINENT");
      expect(employs.inverseLabels).toEqual({ "": "is employed by" });
    });

    it("lets an own tag shadow the partner's in another case", () => {
      const lens = indexSiteLens(
        {
          groups: [],
          classes: [{ uri: `${EX}Thing` }],
          properties: [{ uri: `${EX}worksFor`, inverseLabels: { EN: "own" } }],
        },
        LENS_OUTLINE,
      );
      expect(lens.propertyLens(`${EX}worksFor`).inverseLabels).toEqual({
        "": "employs (untagged)",
        EN: "own",
      });
    });

    it("answers nothing for a property the outline does not know", () => {
      expect(index.propertyLens(`${EX}ghostProperty`)).toEqual({
        visibility: null,
        pluralLabels: {},
        inverseLabels: {},
        inversePluralLabels: {},
        inverseVisibility: null,
      });
    });

    it("answers nothing for a partner the outline does not know", () => {
      const lens = indexSiteLens(SITE_LENS_FIXTURE, {
        classes: [],
        properties: [{ uri: `${EX}orphan`, inverse: `${EX}missing` }],
      });
      expect(lens.propertyLens(`${EX}orphan`).inverseLabels).toEqual({});
    });
  });

  describe("unknown IRIs", () => {
    it("collects them deduplicated and sorted, and ignores their entries", () => {
      expect(index.unknownIris).toEqual([
        `${EX}Ghost`,
        `${EX}ghostProperty`,
        `${EX}haunts`,
      ]);
      expect(index.classLens(`${EX}Spectre`).visibility).toBeNull();
      expect(index.classLens(`${EX}Ghost`).visibility).toBeNull();
      expect(
        index.fieldLens(`${EX}Thing`, `${EX}ghostProperty`).order,
      ).toBeNull();
    });
  });

  describe("programmer errors", () => {
    const empty = { groups: [], classes: [], properties: [] };

    it("throws on a duplicate group, class or property", () => {
      const group = { uri: `${EX}g` };
      const lensClass = { uri: `${EX}Thing` };
      const property = { uri: `${EX}name` };
      expect(() =>
        indexSiteLens({ ...empty, groups: [group, group] }, LENS_OUTLINE),
      ).toThrow(`declares the group ${EX}g twice`);
      expect(() =>
        indexSiteLens(
          { ...empty, classes: [lensClass, lensClass] },
          LENS_OUTLINE,
        ),
      ).toThrow(`declares the class ${EX}Thing twice`);
      expect(() =>
        indexSiteLens(
          { ...empty, properties: [property, property] },
          LENS_OUTLINE,
        ),
      ).toThrow(`declares the property ${EX}name twice`);
    });

    it("throws on a duplicate field of a class", () => {
      const field = { property: `${EX}name` };
      expect(() =>
        indexSiteLens(
          {
            ...empty,
            classes: [{ uri: `${EX}Thing`, fields: [field, field] }],
          },
          LENS_OUTLINE,
        ),
      ).toThrow(`field of ${EX}Thing on the property ${EX}name twice`);
    });

    it("throws on a field in an undeclared group", () => {
      expect(() =>
        indexSiteLens(
          {
            ...empty,
            classes: [
              {
                uri: `${EX}Thing`,
                fields: [{ property: `${EX}name`, group: `${EX}nowhere` }],
              },
            ],
          },
          LENS_OUTLINE,
        ),
      ).toThrow(`undeclared group ${EX}nowhere`);
    });
  });
});
