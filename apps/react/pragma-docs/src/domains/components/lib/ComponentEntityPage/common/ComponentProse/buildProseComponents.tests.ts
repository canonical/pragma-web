import { defaultComponents } from "@canonical/react-markdown";
import { describe, expect, it } from "vitest";
import buildProseComponents from "./buildProseComponents.js";

/** The tag each heading level renders as, h1 to h6. */
const readLevels = (source: string) => {
  const map = buildProseComponents(source) as Record<string, unknown>;
  return ["h1", "h2", "h3", "h4", "h5", "h6"].map((tag) => map[tag]);
};

describe("buildProseComponents", () => {
  it("moves a text authored from level 1 two levels down", () => {
    expect(readLevels("# One\n\n## Two")).toEqual([
      "h3",
      "h4",
      "h5",
      "h6",
      "h6",
      "h6",
    ]);
  });

  it("keeps a text authored from level 3 where it is", () => {
    expect(readLevels("### When to use\n\nText")).toEqual([
      "h3",
      "h3",
      "h3",
      "h4",
      "h5",
      "h6",
    ]);
  });

  it("moves a text authored from level 4 one level up", () => {
    expect(readLevels("#### Four\n\n##### Five").slice(3, 5)).toEqual([
      "h3",
      "h4",
    ]);
  });

  it("leaves a text with no heading at level 3 and below", () => {
    expect(readLevels("Text").at(0)).toBe("h3");
  });

  it("keeps the design system's elements", () => {
    expect(buildProseComponents("Text")).toMatchObject(defaultComponents);
  });
});
