// @vitest-environment node

/**
 * The app route table: the lenses and the keyboard allocation it declares,
 * and its address space — a chip and the route it lands on must speak the
 * SAME address for the same noun, byte-identical, encoding included. If
 * either side changes its encoding, these pins snap.
 */

import { collectLenses, collectShortcuts } from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import { resolveChipHref } from "#lib/Chip";
import {
  COMPONENT_URI,
  STANDARD_URI,
  UIBLOCK_TERM,
} from "../testing/fixtures.js";
import { appRoutes } from "./routes.js";

describe("appRoutes", () => {
  it("declares the app's lenses: names, labels and tiers, in rail order", () => {
    expect(
      collectLenses(appRoutes).map(({ name, label, tier }) => ({
        name,
        label,
        tier,
      })),
    ).toEqual([
      { name: "home", label: "Home", tier: 2 },
      { name: "components", label: "Components", tier: 2 },
      { name: "definitions", label: "Definitions", tier: 1 },
      { name: "standards", label: "Standards", tier: 1 },
      { name: "journeys", label: "Journeys", tier: 2 },
      { name: "guides", label: "Guides", tier: 1 },
    ]);
  });

  it("allocates the app's shortcut keys", () => {
    // The integration pin: this is the one that fails the day two routes
    // collide, against the table the app actually runs. It is also the
    // reason `collectShortcuts`' throws are safe in production — the
    // allocation is static route data, and it cannot ship wrong without
    // failing here.
    expect(Object.fromEntries(collectShortcuts(appRoutes).byKey)).toEqual({
      "1": "home",
      "2": "components",
      "3": "definitions",
      "4": "standards",
      "5": "journeys",
      "6": "guides",
    });
  });

  it("round-trips componentEntity render() against resolveChipHref (the D31 landing pin)", () => {
    expect(appRoutes.componentEntity.render({ uri: COMPONENT_URI })).toBe(
      resolveChipHref(COMPONENT_URI, "component"),
    );
  });

  it("round-trips definitionsTerm render() against the term chip href", () => {
    expect(appRoutes.definitionsTerm.render({ term: UIBLOCK_TERM })).toBe(
      resolveChipHref(UIBLOCK_TERM, "term"),
    );
  });

  // `resolveChipHref` is form-agnostic and would pass with a compact IRI
  // too; the absolute form is pinned because a pin that tests a shape the
  // app no longer emits tests nothing.
  it("round-trips standardEntity render() against the standard chip href", () => {
    expect(appRoutes.standardEntity.render({ uri: STANDARD_URI })).toBe(
      resolveChipHref(STANDARD_URI, "standard"),
    );
  });
});
