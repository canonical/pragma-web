/** The stylesheet's contract, which jsdom cannot lay out. */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import IconButton from "./IconButton.js";

const here = path.dirname(fileURLToPath(import.meta.url));

/** The sheet as written, comments included. */
const source = readFileSync(path.join(here, "styles.css"), "utf8");

// Comments and the layer name dropped, whitespace collapsed.
const sheet = source
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/@layer[^{;]*/g, "")
  .replace(/\s+/g, " ");

/** The density and context scopes. */
const SCOPES = ":where(.comfortable, .dense, .app, .site, .docs)";

/** The declarations of the first rule whose selector is exactly `selector`. */
const findDeclarations = (selector: string): string | undefined => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = sheet.match(new RegExp(`(?:^|[;{}]) ?${escaped} ?\\{([^}]*)`));
  return match?.at(1);
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

  it("sets the inline padding on .ds.button.icon-button, independent of order", () => {
    // (0,3,0) beats Button's (0,2,0) in either order.
    expect(findDeclarations(".ds.button.icon-button")).toMatch(
      /padding-inline: var\(--icon-button-padding-inline/,
    );
  });

  it("keeps its token on the component, with no :root rule", () => {
    expect(sheet).not.toMatch(/(?:^|[;{}]) ?:root ?\{/);
    expect(findDeclarations(".ds.button.icon-button")?.trim()).toBe(
      "padding-inline: var(--icon-button-padding-inline, 0px);",
    );
  });

  it("works the inline padding out from the density inputs inside a scope", () => {
    // (cell - line) / 2 - border.
    expect(
      findDeclarations(`${SCOPES} .ds.icon-button`)?.replace(/\s+/g, ""),
    ).toBe(
      "--icon-button-padding-inline:calc((var(--density-line-height-effective)-var(--control-seat-line))/2-var(--button-border-width,0px));",
    );
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

  it("sets on the icon only what Button's icon slot leaves unset", () => {
    // Tied at (0,3,0) with either load order, so no shared property.
    const buttonSheet = readFileSync(
      path.join(here, "../../component/Button/styles.css"),
      "utf8",
    )
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\s+/g, " ");
    const buttonIcon = buttonSheet
      .match(/\.ds\.button > \.icon \{([^}]*)\}/)
      ?.at(1);
    const listPropertyNames = (declarations = "") =>
      declarations
        .split(";")
        .map((declaration) => declaration.split(":").at(0)?.trim())
        .filter(Boolean);
    const iconRule = sheet.match(/& > \.icon \{([^}]*)\}/)?.at(1);
    expect(listPropertyNames(iconRule)).toEqual([
      "position",
      "inset",
      "margin",
    ]);
    expect(listPropertyNames(buttonIcon).length).toBeGreaterThan(0);
    for (const property of listPropertyNames(iconRule)) {
      expect(listPropertyNames(buttonIcon)).not.toContain(property);
    }
  });

  it("finds every literal length, of any unit and either sign", () => {
    // Control for the matcher.
    expect(
      findLiteralLengths(
        'margin: -1px; inline-size: 2vmin; inset: 1pt; block-size: 1dvh; a: 1cqi; b: 1mm; c: 1in; d: calc(100% - 2px); e: .5Q; --dimension-200: var(--x-2, 3); content: "4px"; order: 2;',
      ),
    ).toEqual([
      "-1px",
      "2vmin",
      "1pt",
      "1dvh",
      "1cqi",
      "1mm",
      "1in",
      "100%",
      "2px",
      ".5Q",
    ]);
  });

  it("uses no literal lengths other than zero and the carrier's 1lh", () => {
    expect(
      findLiteralLengths(sheet).filter(
        (length) => !/^-?0*\.?0+(px)?$/.test(length),
      ),
    ).toEqual(["1lh"]);
  });
});

/** Every literal length in `css`, ignoring strings and custom-property names. */
function findLiteralLengths(css: string): string[] {
  return (
    css
      .replace(/"[^"]*"/g, "")
      .replace(/--[\w-]+/g, "")
      .match(/(?<![\w.])-?(?:\d+\.?\d*|\.\d+)(?:[a-z]+|%)/gi) ?? []
  );
}
