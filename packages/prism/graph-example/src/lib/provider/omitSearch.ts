import { type ASTNode, Kind, type Location, parse, visit } from "graphql";
import { SEARCH_TYPE_NAMES } from "./constants.js";

/**
 * Whether `owner`, the node that holds a field list, is a `Query`
 * definition or extension.
 */
const isQueryType = (owner: ASTNode | readonly ASTNode[]): boolean =>
  "kind" in owner &&
  (owner.kind === Kind.OBJECT_TYPE_DEFINITION ||
    owner.kind === Kind.OBJECT_TYPE_EXTENSION) &&
  owner.name.value === "Query";

/** Whether `node` defines one of the search extension's own types. */
const isSearchType = (node: ASTNode): boolean =>
  node.kind === Kind.OBJECT_TYPE_DEFINITION &&
  SEARCH_TYPE_NAMES.has(node.name.value);

/**
 * Widen the span `[start, end)` of a definition in `sdl` to its whole
 * lines: back to the line's start, on through its newline, and through one
 * blank line after it, so the text around it keeps its layout.
 */
const widenToLines = (
  sdl: string,
  start: number,
  end: number,
): readonly [number, number] => {
  const lineStart = sdl.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = sdl.indexOf("\n", end);
  const after = lineEnd === -1 ? sdl.length : lineEnd + 1;
  return [lineStart, sdl.startsWith("\n", after) ? after + 1 : after];
};

/**
 * Leave the search extension out of `sdl`: `Query.search` and the five
 * types only it reads (`SEARCH_TYPE_NAMES`), each with its description.
 * Every other line of the SDL, comments included, is kept as written.
 *
 * @param sdl - A provider's SDL, which declares the search extension.
 * @returns The same SDL without it.
 */
export default function omitSearch(sdl: string): string {
  const spans: Array<Location | undefined> = [];
  visit(parse(sdl), {
    enter(node) {
      if (isSearchType(node)) spans.push(node.loc);
    },
    FieldDefinition(field, _key, _parent, _path, ancestors) {
      // The field's parent is its type's field list; its ancestors end with
      // the type's node.
      const owner = ancestors.at(-1);
      if (field.name.value === "search" && owner && isQueryType(owner))
        spans.push(field.loc);
    },
  });
  return spans
    .filter((loc) => loc !== undefined)
    .map((loc) => widenToLines(sdl, loc.start, loc.end))
    .toSorted(([a], [b]) => b - a)
    .reduce(
      (kept, [start, end]) => kept.slice(0, start) + kept.slice(end),
      sdl,
    );
}
