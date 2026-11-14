// @vitest-environment node

import { readFileSync } from "node:fs";
import { listServedExtensions } from "@canonical/prism-contract";
import { describe, expect, it } from "vitest";
import { SITE_EXTENSIONS } from "./extensions.js";

describe("SITE_EXTENSIONS", () => {
  it("names exactly the extensions the committed schema serves", () => {
    const sdl = readFileSync(
      new URL("./relay/schema.graphql", import.meta.url),
      "utf8",
    );
    expect(listServedExtensions(sdl)).toEqual(SITE_EXTENSIONS);
  });
});
