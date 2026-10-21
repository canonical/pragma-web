// @vitest-environment node

/**
 * The app route table: the lenses and the keyboard allocation it declares.
 */

import { collectLenses, collectShortcuts } from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
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
});
