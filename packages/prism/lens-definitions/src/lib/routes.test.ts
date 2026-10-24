import { collectLenses, collectShortcuts } from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import { definitionsRoutes } from "./routes.js";
import { DefinitionsIcon } from "./ui/DefinitionsIcon/index.js";
import { DefinitionsPage } from "./ui/DefinitionsPage/index.js";
import warmDefinitions from "./warmDefinitions.js";

describe("definitionsRoutes", () => {
  it("carries exactly the two route names a site's table keeps", () => {
    expect(Object.keys(definitionsRoutes)).toEqual([
      "definitions",
      "definitionsTerm",
    ]);
    expect(definitionsRoutes.definitions.url).toBe("/definitions");
    expect(definitionsRoutes.definitionsTerm.url).toBe("/definitions/:term");
  });

  it("declares the lens on the explorer, and on the explorer only", () => {
    expect(collectLenses(definitionsRoutes)).toEqual([
      {
        name: "definitions",
        label: "Definitions",
        icon: DefinitionsIcon,
        order: 3,
        tier: 1,
      },
    ]);
  });

  it("claims the shortcut 3 for the explorer", () => {
    const { byKey, byRoute } = collectShortcuts(definitionsRoutes);
    expect([...byKey]).toEqual([["3", "definitions"]]);
    expect(byRoute.get("definitionsTerm")).toBeUndefined();
  });

  it("mounts one page on both routes and warms both through the lens's operation", () => {
    for (const route of Object.values(definitionsRoutes)) {
      expect(route.content).toBe(DefinitionsPage);
      expect(route.warm).toBe(warmDefinitions);
    }
  });
});
