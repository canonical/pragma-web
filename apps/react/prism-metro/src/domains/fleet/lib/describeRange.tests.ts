import { createTranslator } from "@canonical/i18n-core";
import { describe, expect, it } from "vitest";
import { MESSAGES } from "#i18n";
import describeRange from "./describeRange.js";
import formatLength from "./formatLength.js";

/** The app's translator, as the catalog hook gives it outside a provider. */
const t = createTranslator("en", MESSAGES);

describe("describeRange", () => {
  it("reads one value when every measure shares it", () => {
    expect(describeRange([60000, 60000], formatLength, t)).toBe("60 m");
  });

  it("reads the range from the least to the most", () => {
    expect(describeRange([120000, 60000], formatLength, t)).toBe(
      "60 m to 120 m",
    );
  });
});
