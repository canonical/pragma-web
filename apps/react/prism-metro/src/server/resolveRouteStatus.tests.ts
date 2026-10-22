// @vitest-environment node

import { describe, expect, it } from "vitest";
import resolveRouteStatus from "./resolveRouteStatus.js";

describe("resolveRouteStatus", () => {
  it.each([
    "/stations",
    "/stations/metro%3Anorthgate",
    "/lines",
    "/lines/metro%3Acircle-line",
    "/definitions",
    "/definitions/metro%3AStation",
  ])("answers %s with 200", (url) => {
    expect(resolveRouteStatus(url)).toBe(200);
  });

  it("answers an unknown URL with 404", () => {
    expect(resolveRouteStatus("/nowhere")).toBe(404);
  });
});
