// @vitest-environment node

import { readFileSync } from "node:fs";
import { listServedExtensions } from "@canonical/prism-contract";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SEARCH_OFF } from "./constants.js";
import { SCHEMA_EXTENSIONS, SITE_EXTENSIONS } from "./extensions.js";
import selectSiteExtensions from "./selectSiteExtensions.js";

/** Read a schema the schema writer commits, from the app's root. */
const readSchema = (path: string): string =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("SITE_EXTENSIONS", () => {
  it("names exactly the extensions the committed schema serves", () => {
    expect(
      listServedExtensions(readSchema("src/relay/schema.graphql")),
    ).toEqual(SCHEMA_EXTENSIONS);
    expect(SITE_EXTENSIONS).toEqual(SCHEMA_EXTENSIONS);
  });

  it("names exactly the extensions the provider serves without search, with PRISM_SEARCH=off (W8-A2)", async () => {
    vi.stubEnv("PRISM_SEARCH", SEARCH_OFF);
    vi.resetModules();
    const { SITE_EXTENSIONS: offExtensions } = await import("./extensions.js");
    expect(
      listServedExtensions(readSchema("testing/schema.no-search.graphql")),
    ).toEqual(offExtensions);
    expect(offExtensions).not.toContain("search");
  });
});

describe("selectSiteExtensions", () => {
  it("keeps every extension under any other setting", () => {
    expect(selectSiteExtensions(SCHEMA_EXTENSIONS, "on")).toEqual(
      SCHEMA_EXTENSIONS,
    );
  });
});
