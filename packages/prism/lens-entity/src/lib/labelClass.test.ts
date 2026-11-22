import { describe, expect, it } from "vitest";
import { METRO_NAMESPACES } from "../../testing/fixtures.js";
import labelClass from "./labelClass.js";

const STATION = "https://metro.example/onto#Station";

describe("labelClass", () => {
  it("names a class by its label", () => {
    expect(
      labelClass({ uri: STATION, label: "Station" }, METRO_NAMESPACES),
    ).toBe("Station");
  });

  it("names a class with no label by its compact IRI", () => {
    expect(labelClass({ uri: STATION, label: null }, METRO_NAMESPACES)).toBe(
      "metro:Station",
    );
  });
});
