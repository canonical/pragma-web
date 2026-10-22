import type { Root } from "hast";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import buildSanitizedRehypePreset from "./buildSanitizedRehypePreset.js";
import { sanitizedRehypePreset } from "./constants.js";

/** A root holding one link to `href`. */
function buildLink(href: string): Root {
  return {
    type: "root",
    children: [
      {
        type: "element",
        tagName: "a",
        properties: { href },
        children: [{ type: "text", value: "Link" }],
      },
    ],
  };
}

/** Run a preset over a link to `href` and read the link's properties back. */
function runLink(
  preset: ReturnType<typeof buildSanitizedRehypePreset>,
  href: string,
): unknown {
  const tree = unified()
    .use([...preset])
    .runSync(buildLink(href)) as Root;
  return tree.children.at(0);
}

describe("buildSanitizedRehypePreset", () => {
  it("is the sanitised preset itself when no scheme is named", () => {
    expect(buildSanitizedRehypePreset([])).toBe(sanitizedRehypePreset);
  });

  it("keeps a link in a named scheme", () => {
    expect(
      runLink(buildSanitizedRehypePreset(["ds"]), "ds:global.component.button"),
    ).toMatchObject({ properties: { href: "ds:global.component.button" } });
  });

  it("still keeps the default schemes and still removes the others", () => {
    const preset = buildSanitizedRehypePreset(["ds"]);

    expect(runLink(preset, "https://example.com")).toMatchObject({
      properties: { href: "https://example.com" },
    });
    expect(runLink(preset, "javascript:alert(1)")).toMatchObject({
      properties: {},
    });
    expect(runLink(preset, "cs:code.array.safe_access")).toMatchObject({
      properties: {},
    });
  });
});
