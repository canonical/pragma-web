import { DIRECTION_ARROWS, LOOP_LABEL_LINES } from "./constants.js";
import { compareText, orderBy } from "./geometry.js";
import { requireDefined, requireEntry } from "./require.js";
import type { ClassGraphLayout, LaidOutEdge } from "./types.js";

/**
 * Write a relation edge's label as its lines: one predicate; the two
 * predicates of a pair, an opposite pair each with its arrow and nearer the
 * end that is its range; "‹n› relations" for three or more; a self-loop's
 * predicates stacked, three at most and then "+‹n›".
 *
 * @param layout - The class graph's layout.
 * @param edge - A relation edge.
 * @param formatCount - How "‹n› relations" reads, from the catalog.
 * @returns The label's lines.
 */
export default function formatEdgeLabelLines(
  layout: ClassGraphLayout,
  edge: LaidOutEdge,
  formatCount: (count: number) => string,
): string[] {
  const bundle = requireDefined(edge.bundle, "bundle for a relation edge");
  const { relations } = bundle;
  if (edge.self === true) {
    return relations.length <= LOOP_LABEL_LINES + 1
      ? relations.map((relation) => relation.label)
      : [
          ...relations
            .slice(0, LOOP_LABEL_LINES)
            .map((relation) => relation.label),
          `+${relations.length - LOOP_LABEL_LINES}`,
        ];
  }
  if (relations.length > 2) return [formatCount(relations.length)];
  if (!bundle.opposite) return relations.map((relation) => relation.label);
  return relations
    .map((relation) => {
      const domain = requireEntry(layout.nodes, relation.domain);
      const range = requireEntry(layout.nodes, relation.range);
      const vertical =
        domain.col === range.col || domain.region !== range.region;
      const direction = vertical
        ? range.y > domain.y
          ? "down"
          : "up"
        : range.x > domain.x
          ? "right"
          : "left";
      const arrow = DIRECTION_ARROWS[direction];
      const leading = direction === "right" || direction === "down";
      return {
        label: relation.label,
        text: leading
          ? `${relation.label} ${arrow}`
          : `${arrow} ${relation.label}`,
        rank: leading ? 1 : 0,
      };
    })
    .sort((a, b) => orderBy(a.rank - b.rank, compareText(a.label, b.label)))
    .map((line) => line.text);
}
