import { parseAnatomyYAML } from "@canonical/anatomy-dsl";
import { describe, expect, it } from "vitest";
import { BUTTON_ANATOMY_DSL } from "../../../../../../../testing/anatomyTexts.js";
import buildAnatomyTree from "./buildAnatomyTree.js";

/** A block with a component child, a switch and two sibling roles of one name. */
const COMPOSITE_ANATOMY = `
node:
  uri: global.component.split_button
  styles:
    layout.type: flex
  edges:
    - node:
        uri: global.component.button
      relation: { cardinality: "1", slotName: action }
    - switch:
        on: props
        cases:
          - uri: global.pattern.menu
          - node:
              role: nothing
      relation: { cardinality: "0..1", slotName: extra }
    - node:
        role: divider
      relation: { cardinality: "1" }
    - node:
        role: divider
        styles:
          appearance.border.width: 1px
      relation: { cardinality: "1" }
`;

/** Give a component its page; leave every other block without one. */
const resolveHref = (uri: string) =>
  uri.includes(".component.") ? `/components/ds%3A${uri}` : undefined;

describe("buildAnatomyTree", () => {
  it("reads Button's real anatomy, each node at its binding path", () => {
    const tree = buildAnatomyTree(
      parseAnatomyYAML(BUTTON_ANATOMY_DSL),
      resolveHref,
    );
    expect(tree.id).toBe("$root");
    expect(tree.label).toBe("button");
    expect(tree.form).toBe("named");
    expect(tree.styleCount).toBeGreaterThan(0);
    expect(tree.children.map(({ id }) => id)).toEqual([
      "$root/icon",
      "$root/label text",
      "$root/loading spinner",
    ]);
    expect(tree.children.at(1)?.relation).toEqual({
      cardinality: "1",
      slotName: "label",
    });
  });

  it("links a named component to its page and leaves other blocks unlinked", () => {
    const tree = buildAnatomyTree(
      parseAnatomyYAML(COMPOSITE_ANATOMY),
      resolveHref,
    );
    const action = tree.children.at(0);
    expect(action?.id).toBe("$root/global.component.button");
    expect(action?.href).toBe("/components/ds%3Aglobal.component.button");
    const menu = tree.children.at(1)?.children.at(0);
    expect(menu?.form).toBe("named");
    expect(menu?.href).toBeUndefined();
  });

  it("makes a switch a hollow node of its own over its cases", () => {
    const tree = buildAnatomyTree(
      parseAnatomyYAML(COMPOSITE_ANATOMY),
      resolveHref,
    );
    const extra = tree.children.at(1);
    expect(extra).toMatchObject({
      id: "$root/switch",
      label: "extra",
      form: "switch",
      discriminator: "props",
      relation: { cardinality: "0..1", slotName: "extra" },
    });
    expect(extra?.children.map(({ id, caseValue }) => [id, caseValue])).toEqual(
      [
        ["$root/case[global.pattern.menu]", "global.pattern.menu"],
        ["$root/case[nothing]", "nothing"],
      ],
    );
  });

  it("numbers a repeated sibling's step and counts each node's styles", () => {
    const tree = buildAnatomyTree(
      parseAnatomyYAML(COMPOSITE_ANATOMY),
      resolveHref,
    );
    expect(
      tree.children.slice(2).map(({ id, styleCount }) => [id, styleCount]),
    ).toEqual([
      ["$root/divider[1]", 0],
      ["$root/divider[2]", 1],
    ]);
    expect(tree.styleCount).toBe(1);
  });
});
