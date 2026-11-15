import { defaultComponents } from "@canonical/react-markdown";
import { render } from "@testing-library/react";
import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";
import buildProseComponents from "./buildProseComponents.js";

/** The element each heading level renders, h1 to h6, with an id given. */
const readHeadings = (source: string) => {
  const map = buildProseComponents(source, "usage") as Record<
    string,
    ComponentType<{ id?: string; node?: unknown }>
  >;
  return ["h1", "h2", "h3", "h4", "h5", "h6"].map((tag) => {
    const Heading = map[tag];
    if (Heading === undefined) throw new Error(`no override for ${tag}`);
    const { container } = render(<Heading id="user-content-a" node={{}} />);
    return container.firstElementChild;
  });
};

/** The tag each heading level renders as, h1 to h6. */
const readLevels = (source: string) =>
  readHeadings(source).map((element) => element?.tagName.toLowerCase());

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

  it("prefixes each heading's id with the scope and keeps no node attribute", () => {
    const heading = readHeadings("# One").at(0);
    expect(heading?.id).toBe("usage-user-content-a");
    expect(heading?.hasAttribute("node")).toBe(false);
  });

  it("leaves a heading with no id without one", () => {
    const map = buildProseComponents("# One", "usage") as Record<
      string,
      ComponentType<{ children?: string }>
    >;
    const Heading = map.h1;
    if (Heading === undefined) throw new Error("no override for h1");
    const { container } = render(<Heading>One</Heading>);
    expect(container.firstElementChild?.hasAttribute("id")).toBe(false);
  });

  it("keeps the design system's elements", () => {
    expect(buildProseComponents("Text", "usage")).toMatchObject(
      defaultComponents,
    );
  });
});
