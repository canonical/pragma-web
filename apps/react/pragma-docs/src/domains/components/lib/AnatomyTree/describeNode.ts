import type { Translate } from "#i18n";
import type { AnatomyTreeNode } from "./types.js";

/**
 * Describe a node on its box's second line: a switch's discriminator, a
 * case's value, or the slot that places the node and its cardinality; the
 * root, which nothing places, has no second line.
 *
 * @param node - The node to describe.
 * @param t - The translator the words come from.
 * @returns The second line, or `undefined` for the root.
 */
export default function describeNode(
  node: AnatomyTreeNode,
  t: Translate,
): string | undefined {
  if (node.form === "switch" && node.discriminator !== undefined) {
    return t("anatomy.switch", { discriminator: node.discriminator });
  }
  if (node.caseValue !== undefined) {
    return t("anatomy.case", { value: node.caseValue });
  }
  if (node.relation === undefined) return undefined;
  const { cardinality, slotName } = node.relation;
  return slotName === undefined
    ? t("anatomy.cardinality", { cardinality })
    : t("anatomy.slot", { slot: slotName, cardinality });
}
