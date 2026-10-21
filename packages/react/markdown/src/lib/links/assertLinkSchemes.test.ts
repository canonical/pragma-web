import { describe, expect, it } from "vitest";
import assertLinkSchemes from "./assertLinkSchemes.js";

describe("assertLinkSchemes", () => {
  it("accepts lower-case URL schemes", () => {
    expect(() =>
      assertLinkSchemes(["ds", "cs", "web+app", "a.b-c1"]),
    ).not.toThrow();
  });

  it("accepts no schemes", () => {
    expect(() => assertLinkSchemes([])).not.toThrow();
  });

  it.each(["javascript", "vbscript", "data", "file"])(
    "refuses %s",
    (scheme) => {
      expect(() => assertLinkSchemes(["ds", scheme])).toThrow(
        `links in the "${scheme}" scheme are never kept`,
      );
    },
  );

  it.each(["DS", "JavaScript", "ds:", "1ds", "", "d_s"])(
    "refuses %j, which is not a lower-case URL scheme",
    (scheme) => {
      expect(() => assertLinkSchemes([scheme])).toThrow(
        "is not a lower-case URL scheme",
      );
    },
  );
});
