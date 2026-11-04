import { describe, expect, it } from "vitest";
import { englishArabicConfig as config } from "../../testing/fixtures.js";
import documentAttrs from "./documentAttrs.js";

describe("documentAttrs", () => {
  it("returns lang and dir for a locale", () => {
    expect(documentAttrs(config, "en")).toEqual({ lang: "en", dir: "ltr" });
    expect(documentAttrs(config, "ar")).toEqual({ lang: "ar", dir: "rtl" });
  });
});
