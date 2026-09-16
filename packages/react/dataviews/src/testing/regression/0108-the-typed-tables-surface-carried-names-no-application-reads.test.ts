/**
 * The typed table put names on the package root that no application reads:
 * the render ceiling's number, which the warning already prints; the typed
 * column type, which columns written inline in `createColumns` never name;
 * and a second cell-props type. The shared fixtures likewise exported names
 * no test imports.
 *
 * None of them is exported. The root's type surface is pinned name by name
 * in `index.types.test.ts`; this pins the values.
 */
import { describe, expect, it } from "vitest";
import * as instanceFixtures from "../../../testing/instances.js";
import * as dataviewsReact from "../../index.js";

describe("the typed table's surface", () => {
  it("carries no value an application cannot use", () => {
    expect(dataviewsReact).not.toHaveProperty("RENDER_CEILING");
    expect(instanceFixtures).not.toHaveProperty("INSTANCE_CAPABILITIES");
  });
});
