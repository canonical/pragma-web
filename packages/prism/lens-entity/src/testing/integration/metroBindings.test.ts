// @vitest-environment node

/**
 * The bindings a site over the metro graph declares pass the check a site's
 * `check` step runs against its provider's schema: every type they name is
 * an object type the schema declares and that implements `Node`.
 */

import { assertBindings } from "@canonical/prism-core";
import { createExampleProvider } from "@canonical/prism-graph-example";
import { describe, expect, it } from "vitest";
import { LINES_BINDING, STATIONS_BINDING } from "../../../testing/fixtures.js";

describe("the metro bindings", () => {
  it("name types the metro schema serves as nodes", () => {
    expect(() =>
      assertBindings(createExampleProvider().sdl, [
        STATIONS_BINDING,
        LINES_BINDING,
      ]),
    ).not.toThrow();
  });

  it("fail the check when a binding names a type the schema lacks", () => {
    expect(() =>
      assertBindings(createExampleProvider().sdl, [
        { ...STATIONS_BINDING, typename: "Platform" },
      ]),
    ).toThrow(/does not declare/);
  });
});
