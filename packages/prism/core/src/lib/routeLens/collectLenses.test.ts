import { route } from "@canonical/router-core";
import { describe, expect, it } from "vitest";
import { LENS_ROUTES } from "../../../testing/fixtures.js";
import { collectLenses } from "./collectLenses.js";
import { routeLensFacet } from "./lensFacet.js";

const page = () => null;
const Icon = () => null;

describe("collectLenses", () => {
  it("returns the lenses sorted by order, whatever the table order", () => {
    const routes = {
      guides: route({
        url: "/guides",
        content: page,
        meta: routeLensFacet.of({
          label: "Guides",
          icon: Icon,
          order: 6,
          tier: 1,
        }),
      }),
      quiet: route({ url: "/quiet", content: page }),
      home: route({
        url: "/",
        content: page,
        meta: routeLensFacet.of({
          label: "Home",
          icon: Icon,
          order: 1,
          tier: 2,
        }),
      }),
    } as const;
    expect(
      collectLenses(routes).map(({ name, order }) => [name, order]),
    ).toEqual([
      ["home", 1],
      ["guides", 6],
    ]);
  });

  it("returns no lenses for a table that declares none", () => {
    const routes = { quiet: route({ url: "/quiet", content: page }) } as const;
    expect(collectLenses(routes)).toEqual([]);
  });

  it("throws when two lenses claim the same order, naming both", () => {
    const routes = {
      definitions: route({
        url: "/definitions",
        content: page,
        meta: routeLensFacet.of({
          label: "Definitions",
          icon: Icon,
          order: 3,
          tier: 1,
        }),
      }),
      dictionary: route({
        url: "/dictionary",
        content: page,
        meta: routeLensFacet.of({
          label: "Dictionary",
          icon: Icon,
          order: 3,
          tier: 1,
        }),
      }),
    } as const;
    expect(() => collectLenses(routes)).toThrow(
      'lens order 3 is claimed by both "definitions" and "dictionary"',
    );
  });

  it("throws when a route taking params declares a lens", () => {
    const routes = {
      term: route({
        url: "/definitions/:term",
        content: page,
        meta: routeLensFacet.of({
          label: "Definitions",
          icon: Icon,
          order: 3,
          tier: 1,
        }),
      }),
    } as const;
    expect(() => collectLenses(routes)).toThrow(
      'route "term" takes params (/definitions/:term) and cannot be a lens',
    );
  });

  it("collects the fixture table's lenses: names, labels and tiers, in rail order", () => {
    expect(
      collectLenses(LENS_ROUTES).map(({ name, label, tier }) => ({
        name,
        label,
        tier,
      })),
    ).toEqual([
      { name: "home", label: "Home", tier: 2 },
      { name: "catalog", label: "Catalog", tier: 1 },
      { name: "glossary", label: "Glossary", tier: 1 },
    ]);
  });
});
