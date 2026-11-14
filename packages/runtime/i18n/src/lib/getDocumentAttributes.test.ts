import { describe, expect, it } from "vitest";
import { englishArabicConfig as config } from "../../testing/fixtures.js";
import getDocumentAttributes from "./getDocumentAttributes.js";

describe("getDocumentAttributes", () => {
  it("returns lang and dir for a locale", () => {
    expect(getDocumentAttributes(config, "en")).toEqual({
      lang: "en",
      dir: "ltr",
    });
    expect(getDocumentAttributes(config, "ar")).toEqual({
      lang: "ar",
      dir: "rtl",
    });
  });
});
