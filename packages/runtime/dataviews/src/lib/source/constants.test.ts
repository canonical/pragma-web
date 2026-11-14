import { describe, expect, it } from "vitest";
import { ROOT_NUMERIC_COLLATION } from "./constants.js";

describe("constants", () => {
  it("collates by the root order, numerically", () => {
    expect(ROOT_NUMERIC_COLLATION).toBe("en-u-kn-true");
    const collator = new Intl.Collator(ROOT_NUMERIC_COLLATION);
    expect(collator.compare("item2", "item10")).toBeLessThan(0);
  });
});
