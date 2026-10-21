import { describe, expect, it } from "vitest";
import matchesEntityText from "./matchesEntityText.js";

const NORTHGATE = { title: "Northgate", curie: "metro:northgate" };

describe("matchesEntityText", () => {
  it("matches every entry on an empty or blank search", () => {
    expect(matchesEntityText("", NORTHGATE)).toBe(true);
    expect(matchesEntityText("   ", NORTHGATE)).toBe(true);
  });

  it("matches a substring of the title, ignoring case and outer space", () => {
    expect(matchesEntityText(" NORTH ", NORTHGATE)).toBe(true);
  });

  it("matches a substring of the compact address", () => {
    expect(matchesEntityText("metro:north", NORTHGATE)).toBe(true);
  });

  it("rejects an entry neither field contains", () => {
    expect(matchesEntityText("harbour", NORTHGATE)).toBe(false);
  });
});
