// @vitest-environment node

/**
 * The routed document's HTTP status, resolved from the app's real route
 * table before the renderer exists.
 */

import { describe, expect, it } from "vitest";
import { resolveRouteStatus } from "./routeQueries.js";

describe("resolveRouteStatus", () => {
  // The renderer starts at 200 and only ever moves on a shell error, so
  // without this the not-found page ships under a 200 and every crawler is
  // told the URL is real.
  it("is 200 for a matched route", () => {
    expect(resolveRouteStatus("/components")).toBe(200);
  });

  it("is 404 for a URL no route matches", () => {
    expect(resolveRouteStatus("/no-such-page")).toBe(404);
  });

  it("is 404 for the not-found route itself", () => {
    expect(resolveRouteStatus("/not-found")).toBe(404);
  });

  it("ignores the query string when deciding", () => {
    expect(resolveRouteStatus("/components?tier=global")).toBe(200);
  });
});
