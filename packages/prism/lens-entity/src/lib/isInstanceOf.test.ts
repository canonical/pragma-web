import { describe, expect, it } from "vitest";
import isInstanceOf from "./isInstanceOf.js";

const STATION = "https://metro.example/onto#Station";
const STOP = "https://metro.example/onto#Stop";
const LINE = "https://metro.example/onto#Line";

describe("isInstanceOf", () => {
  it("accepts an entity of the class itself", () => {
    expect(isInstanceOf({ uri: STATION, superclasses: [] }, STATION)).toBe(
      true,
    );
  });

  it("accepts an entity of a subclass, at any depth", () => {
    const interchange = {
      uri: "https://metro.example/onto#Interchange",
      superclasses: [{ uri: STATION }, { uri: STOP }],
    };
    expect(isInstanceOf(interchange, STATION)).toBe(true);
    expect(isInstanceOf(interchange, STOP)).toBe(true);
  });

  it("rejects an entity of an unrelated class", () => {
    expect(isInstanceOf({ uri: LINE, superclasses: [] }, STATION)).toBe(false);
  });
});
