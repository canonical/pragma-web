// @vitest-environment node

import { describe, expect, it } from "vitest";
import { notFoundRoute } from "../routes.js";
import selectRoutableUrl from "./selectRoutableUrl.js";

describe("selectRoutableUrl", () => {
  it.each([
    "/stations",
    "/stations/metro%3Anorthgate",
    "/nowhere",
    "/stations?q=%ZZ",
  ])("routes %s by its own URL", (url) => {
    expect(selectRoutableUrl(url)).toBe(url);
  });

  it.each(["/stations/%ZZ", "/stations/%E0%A4%A", "/definitions/%ZZ?q=1"])(
    "routes %s, whose path does not decode, as the not-found page",
    (url) => {
      expect(selectRoutableUrl(url)).toBe(notFoundRoute.url);
    },
  );
});
