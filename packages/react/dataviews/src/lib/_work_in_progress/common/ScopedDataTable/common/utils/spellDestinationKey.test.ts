import { describe, expect, it } from "vitest";
import spellDestinationKey from "./spellDestinationKey.js";

describe("spellDestinationKey", () => {
  it("spells the change, then the column", () => {
    expect(spellDestinationKey("name", "move-left")).toBe("move-left:name");
  });

  it("keeps each change of one column apart", () => {
    expect(spellDestinationKey("name", "hide")).not.toBe(
      spellDestinationKey("name", "show"),
    );
  });
});
