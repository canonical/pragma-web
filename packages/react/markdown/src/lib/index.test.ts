import { describe, expect, it } from "vitest";
import * as publicApi from "./index.js";

describe("the package barrel", () => {
  it("exports the link scheme rules `linkSchemes` is checked against", () => {
    expect(publicApi.REFUSED_LINK_SCHEMES).toEqual([
      "javascript",
      "vbscript",
      "data",
      "file",
    ]);
    expect(publicApi.LINK_SCHEME_PATTERN.test("ds")).toBe(true);
    expect(publicApi.LINK_SCHEME_PATTERN.test("DS")).toBe(false);
  });
});
