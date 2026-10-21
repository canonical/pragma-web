// @vitest-environment node

/**
 * The site's homes, resolved against the route table the app runs.
 */

import { createStaticRouter } from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import { homes } from "./homes.js";
import { appRoutes } from "./routes.js";

const router = createStaticRouter(appRoutes, "/");

/** Resolve the home of a node of `__typename` addressed by `uri`. */
const resolveHome = (__typename: string, uri: string): string | undefined =>
  homes[__typename]?.({ __typename, uri }, router);

describe("homes", () => {
  it("houses a component on its entity page", () => {
    expect(resolveHome("Component", "ds:global.component.button")).toBe(
      "/components/ds%3Aglobal.component.button",
    );
  });

  it("houses an ontology class in the Definitions lens", () => {
    expect(resolveHome("OntologyClass", "ds:Component")).toBe(
      "/definitions/ds%3AComponent",
    );
  });

  it("houses no other type", () => {
    expect(Object.keys(homes).sort()).toEqual(["Component", "OntologyClass"]);
    expect(resolveHome("Pattern", "ds:global.pattern.card")).toBeUndefined();
  });
});
