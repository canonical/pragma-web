import { describe, expect, it } from "vitest";
import readLocalName from "./readLocalName.js";

describe("readLocalName", () => {
  it("reads the last segment of an absolute address", () => {
    expect(
      readLocalName(
        "https://ds.canonical.com/global.modifier_family.importance",
      ),
    ).toBe("importance");
  });

  it("reads the last segment of a compact address", () => {
    expect(readLocalName("ds:global.modifier.primary")).toBe("primary");
  });
});
