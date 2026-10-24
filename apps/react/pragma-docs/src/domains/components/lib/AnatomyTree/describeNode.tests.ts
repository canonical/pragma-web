import { createTranslator } from "@canonical/i18n-core";
import { describe, expect, it } from "vitest";
import { MESSAGES } from "#i18n";
import { BUTTON_TREE } from "../../../../../testing/anatomyTrees.js";
import describeNode from "./describeNode.js";

const t = createTranslator("en", MESSAGES);

/** The node of an id in the button's tree. */
const findNode = (id: string) => {
  const visit = (node: typeof BUTTON_TREE): typeof BUTTON_TREE | undefined =>
    node.id === id ? node : node.children.map(visit).find(Boolean);
  const node = visit(BUTTON_TREE);
  if (node === undefined) throw new Error(`${id} is not in the tree`);
  return node;
};

describe("describeNode", () => {
  it("gives the root no second line", () => {
    expect(describeNode(BUTTON_TREE, t)).toBeUndefined();
  });

  it("names the slot and its cardinality", () => {
    expect(describeNode(findNode("$root/global.component.icon"), t)).toBe(
      "icon · 0..1",
    );
  });

  it("names the cardinality alone when no slot places the node", () => {
    expect(describeNode(findNode("$root/spacer[1]"), t)).toBe("1");
  });

  it("names what a switch switches on, and a case's value", () => {
    expect(describeNode(findNode("$root/switch"), t)).toBe("switch on props");
    expect(describeNode(findNode("$root/case[text]"), t)).toBe("case text");
  });
});
