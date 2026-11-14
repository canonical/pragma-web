/**
 * A class's ancestors level by level: its parents, then its grandparents, and
 * so on, each ancestor once, at its shortest distance. The class itself is in
 * no level, and a cycle in the hierarchy ends the walk.
 *
 * @param classUri - The class whose ancestors to list.
 * @param parents - Each class's direct superclasses.
 * @returns One array of IRIs per distance, nearest first; empty for a root.
 */
export function listAncestorLevels(
  classUri: string,
  parents: ReadonlyMap<string, readonly string[]>,
): readonly (readonly string[])[] {
  const levels: string[][] = [];
  const seen = new Set<string>([classUri]);
  let frontier: readonly string[] = [classUri];
  while (frontier.length > 0) {
    const next = frontier
      .flatMap((uri) => parents.get(uri) ?? [])
      .filter((uri) => {
        const fresh = !seen.has(uri);
        seen.add(uri);
        return fresh;
      });
    if (next.length > 0) {
      levels.push(next);
    }
    frontier = next;
  }
  return levels;
}
