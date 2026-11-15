import type { TokenBindingRow, TokenBindingsOfPart } from "./types.js";

/**
 * A component's token bindings grouped by part, the parts in the order the
 * graph first names them, and within a part in fallback order (rank
 * ascending, the graph's order among equal ranks). A binding the graph
 * records twice for one part (one symbol at one rank, read by two style
 * properties) is listed once. A binding with no part, symbol or rank is
 * left out.
 */
export default function groupBindings(
  bindings: readonly {
    readonly node: string | null | undefined;
    readonly consumesSymbol: string | null | undefined;
    readonly rank: number | null | undefined;
  }[],
): readonly TokenBindingsOfPart[] {
  const parts = new Map<string, TokenBindingRow[]>();
  for (const { node, consumesSymbol, rank } of bindings) {
    if (!node || !consumesSymbol || typeof rank !== "number") continue;
    const rows = parts.get(node) ?? [];
    if (
      !rows.some((row) => row.symbol === consumesSymbol && row.rank === rank)
    ) {
      rows.push({ symbol: consumesSymbol, rank });
    }
    parts.set(node, rows);
  }
  return [...parts].map(([part, rows]) => ({
    part,
    rows: rows.toSorted((a, b) => a.rank - b.rank),
  }));
}
