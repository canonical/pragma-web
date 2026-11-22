import { type ASTNode, Kind, parse } from "graphql";
import { SEARCH_TYPE_NAMES } from "./constants.js";

/** Whether `node` is the `search` field of a `Query` definition or extension. */
const isSearchFieldOf = (owner: ASTNode, field: ASTNode): boolean =>
  (owner.kind === Kind.OBJECT_TYPE_DEFINITION ||
    owner.kind === Kind.OBJECT_TYPE_EXTENSION) &&
  owner.name.value === "Query" &&
  field.kind === Kind.FIELD_DEFINITION &&
  field.name.value === "search";

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
  const spans = parse(sdl).definitions.flatMap((definition) => {
    if (isSearchType(definition)) return [definition.loc];
    const fields = "fields" in definition ? (definition.fields ?? []) : [];
    return fields
      .filter((field) => isSearchFieldOf(definition, field))
      .map((field) => field.loc);
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
