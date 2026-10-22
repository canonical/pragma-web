// @vitest-environment node

import { readFileSync } from "node:fs";
import { assertBindings, assertBindingsLive } from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import createMetroExecute from "../../../testing/createMetroExecute.js";
import { LINES_BINDING, STATIONS_BINDING } from "./bindings.js";

const BINDINGS = [STATIONS_BINDING, LINES_BINDING];

// The site's binding check. The committed SDL is what `schema:check` keeps in
// step with the provider, so asserting against it is the check step's half;
// the in-process provider stands in for the running graph a boot would ask.
describe("the site's bindings", () => {
  it("name types the metro schema declares as Node implementers", () => {
    const sdl = readFileSync(
      new URL("../../relay/schema.graphql", import.meta.url),
      "utf8",
    );
    expect(() => assertBindings(sdl, BINDINGS)).not.toThrow();
  });

  it("name classes the metro graph knows", async () => {
    await expect(
      assertBindingsLive(createMetroExecute(), BINDINGS),
    ).resolves.toBeUndefined();
  });
});
