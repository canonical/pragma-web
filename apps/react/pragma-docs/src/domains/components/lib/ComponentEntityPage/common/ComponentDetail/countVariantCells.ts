import type { BlockExampleName } from "../../../UIBlockExample/index.js";
import { BLOCK_EXAMPLE_FAMILIES } from "../../../UIBlockExample/index.js";
import { readLocalName } from "../ComponentVariants/index.js";

/**
 * How many variant cells a component's families give `example`: the
 * modifiers of every family it honours. The page shows its variants
 * section only when there is one.
 */
export default function countVariantCells(
  example: BlockExampleName,
  families: readonly {
    readonly node: {
      readonly uri: string;
      readonly modifiers: { readonly edges: readonly unknown[] };
    };
  }[],
): number {
  const honoured = BLOCK_EXAMPLE_FAMILIES[example];
  return families
    .filter(({ node }) => honoured.includes(readLocalName(node.uri)))
    .reduce((count, { node }) => count + node.modifiers.edges.length, 0);
}
