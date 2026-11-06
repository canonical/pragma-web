/**
 * The stylesheet's contract. jsdom applies no CSS, so a change to this sheet
 * can break the square box or the seated baseline with every render test
 * still green. What is pinned here is what such a change would break: the
 * layer, the selectors each rule hangs on, the generated baseline carrier,
 * the out-of-flow icon, and that every length is a token or a density input.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import IconButton from "./IconButton.js";

const here = path.dirname(fileURLToPath(import.meta.url));

/** The sheet as written, comments included. */
const source = readFileSync(path.join(here, "styles.css"), "utf8");

// Comments and the layer name dropped, so neither prose nor
// `ds.components.global` is ever taken for a selector; whitespace collapsed,
// so a rule is named by its selector list on one line.
const sheet = source
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/@layer[^{;]*/g, "")
  .replace(/\s+/g, " ");

/** The density and context scopes Button's seat reads its inputs from. */
const SCOPES = ":where(.comfortable, .dense, .app, .site, .docs)";

/** The declarations of the first rule whose selector is exactly `selector`. */
const findDeclarations = (selector: string): string | undefined => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = sheet.match(new RegExp(`(?:^|[;{}]) ?${escaped} ?\\{([^}]*)`));
  return match?.[1];
};

describe("IconButton stylesheet", () => {
  it("sits in the ds.components.global layer", () => {
    expect(source).toMatch(/@layer ds\.components\.global \{/);
  });

  it("styles the class the component renders", () => {
    render(<IconButton icon="edit" aria-label="Edit" />);
    const button = document.querySelector("button");
    expect(button).toHaveClass("ds", "button", "icon-button");
  });

  // Fails until the padding rule moves to `.ds.button.icon-button`.
  it.fails("sets the inline padding on .ds.button.icon-button, independent of order", () => {
    // Button's `.ds.button { padding-inline }` is (0,2,0) in the same layer.
    // At (0,3,0) this rule wins wherever the sheets land in a bundle.
    expect(findDeclarations(".ds.button.icon-button")).toMatch(
      /padding-inline: var\(--icon-button-padding-inline\)/,
    );
  });

  it("works the inline padding out from the density inputs inside a scope", () => {
    const declarations = findDeclarations(`${SCOPES} .ds.icon-button`);
    expect(declarations).toContain("--icon-button-padding-inline:");
    expect(declarations).toContain("var(--density-line-height-effective)");
    expect(declarations).toContain("var(--control-seat-line)");
    expect(declarations).toContain("var(--button-border-width, 0px)");
  });

  it("zeroes the block padding only outside a scope", () => {
    expect(findDeclarations(`.ds.icon-button:not(${SCOPES} *)`)?.trim()).toBe(
      "padding-block: 0;",
    );
  });

  it("generates a one-line, 1lh-wide baseline carrier with empty alt text", () => {
    expect(sheet).toMatch(
      /&::before \{ content: "\\200b" \/ ""; inline-size: 1lh; \}/,
    );
  });

  it("takes the icon out of flow and centres it on the padding box", () => {
    expect(sheet).toMatch(
      /& > \.icon \{ position: absolute; inset: 0; margin: auto; \}/,
    );
  });

  it("uses no literal lengths other than zero", () => {
    const lengths = sheet.match(/(?<![\w-])\d*\.?\d+(px|rem|em)\b/g) ?? [];
    expect(lengths.filter((length) => !/^0+(px)?$/.test(length))).toEqual([]);
  });
});
