// @vitest-environment node

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/** Where the package's base forms live, one folder each. */
const UI_DIRECTORY = fileURLToPath(new URL("../../lib/ui", import.meta.url));

/**
 * The colour functions a literal colour is written with: a form's colour
 * comes from a semantic token or from instance data set inline, never from
 * its stylesheet (heuristic 4.2).
 */
const COLOUR_FUNCTION = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i;

/** A hexadecimal colour: `#` and three, four, six or eight hex digits. */
const HEX_COLOUR = /#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b/i;

/**
 * The CSS named colours, `transparent` and `currentColor` aside: those two
 * name no hue, and a mark draws in the colour its form's text takes.
 */
const NAMED_COLOURS = new Set(
  `aliceblue antiquewhite aqua aquamarine azure beige bisque black
  blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse
  chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan
  darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta
  darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen
  darkslateblue darkslategray darkslategrey darkturquoise darkviolet
  deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite
  forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green
  greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender
  lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan
  lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon
  lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue
  lightyellow lime limegreen linen magenta maroon mediumaquamarine
  mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue
  mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream
  mistyrose moccasin navajowhite navy oldlace olive olivedrab orange
  orangered orchid palegoldenrod palegreen paleturquoise palevioletred
  papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red
  rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell
  sienna silver skyblue slateblue slategray slategrey snow springgreen
  steelblue tan teal thistle tomato turquoise violet wheat white
  whitesmoke yellow yellowgreen`.split(/\s+/),
);

/**
 * The one colour literal a form still writes, ledgered: the graph's floor,
 * which a hollow node takes and which the lens canvases declare the same
 * way, because no background token sits 6 L* below the surface in light.
 * Replacing it takes a floor token the canvases and the node share.
 */
const LEDGERED_LITERALS: Readonly<Record<string, readonly string[]>> = {
  EntityGraphNode: [
    "--entity-graph-node-hollow-surface-color: light-dark(\n      oklch(94% 0 0),\n      var(--color-background-container)\n    )",
  ],
};

/** List every stylesheet under a folder, its private subcomponents' too. */
function listStylesheets(folder: string): string[] {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) return listStylesheets(path);
    return entry.name.endsWith(".css") ? [path] : [];
  });
}

/**
 * List the colour literals a stylesheet's declarations hold, each as
 * `property: value`, the last of a rule too, which needs no semicolon;
 * comments and selectors are not read.
 */
function listColourLiterals(source: string): string[] {
  const declarations = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .matchAll(/([-a-z]+)\s*:\s*([^;{}]+)(?:;|(?=\}))/gi);
  return [...declarations].flatMap(([, property, value]) => {
    const words = (value ?? "").toLowerCase().match(/[a-z-]+/g) ?? [];
    const literal =
      COLOUR_FUNCTION.test(value ?? "") ||
      HEX_COLOUR.test(value ?? "") ||
      words.some((word) => NAMED_COLOURS.has(word));
    return literal ? [`${property}: ${value?.trim()}`] : [];
  });
}

/** The package's `Entity*` forms, by folder. */
const ENTITY_FORMS = readdirSync(UI_DIRECTORY).filter((name) =>
  name.startsWith("Entity"),
);

describe("the Entity forms' stylesheets", () => {
  it("are found, one form's at least", () => {
    expect(ENTITY_FORMS).toContain("EntityChip");
    expect(listStylesheets(join(UI_DIRECTORY, "EntityChip"))).not.toEqual([]);
  });

  it.each(ENTITY_FORMS)(
    "%s writes no colour literal but its ledgered ones",
    (form) => {
      const literals = listStylesheets(join(UI_DIRECTORY, form)).flatMap(
        (path) => listColourLiterals(readFileSync(path, "utf8")),
      );
      expect(literals).toEqual(LEDGERED_LITERALS[form] ?? []);
    },
  );

  it("finds each kind of colour literal", () => {
    expect(
      listColourLiterals(
        "a { color: #fff; background: rgb(0 0 0); border-color: red; fill: var(--x); }",
      ),
    ).toEqual(["color: #fff", "background: rgb(0 0 0)", "border-color: red"]);
  });

  it("finds a literal in a rule's last declaration, which has no semicolon", () => {
    expect(listColourLiterals("a { color: red }")).toEqual(["color: red"]);
    expect(
      listColourLiterals("a:hover { fill: var(--x); stroke: #000 }"),
    ).toEqual(["stroke: #000"]);
  });
});
