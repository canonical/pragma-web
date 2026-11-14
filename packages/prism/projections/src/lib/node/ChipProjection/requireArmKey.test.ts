import { describe, expect, it } from "vitest";
import requireArmKey from "./requireArmKey.js";

describe("requireArmKey", () => {
  it("returns the key of the case's type", () => {
    const key = { " $fragmentSpreads": "OntologyClassChip_node" };
    expect(requireArmKey(key, "OntologyClass")).toBe(key);
  });

  it("throws, naming the type, when the node carries no spread for it", () => {
    expect(() => requireArmKey(null, "OntologyClass")).toThrow(
      "the node is a OntologyClass but its composite fragment spreads no OntologyClass arm",
    );
    expect(() => requireArmKey(undefined, "OntologyClass")).toThrow();
  });
});
