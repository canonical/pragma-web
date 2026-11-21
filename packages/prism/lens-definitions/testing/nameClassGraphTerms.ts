import type { ClassGraphInput } from "../src/lib/classGraph/types.js";

/**
 * Name each class and relation of a class graph by its compact term, as
 * the explorer names them: a class by its prefix and the IRI's last
 * segment; a relation by the prefix of a class in its namespace, as a
 * count's numeral links to it.
 *
 * @param input - The classes and relations.
 * @returns Each class's and relation's compact term, by IRI.
 */
export default function nameClassGraphTerms(
  input: ClassGraphInput,
): ReadonlyMap<string, string> {
  const nameTerm = (uri: string, prefix: string): string =>
    `${prefix}:${uri.split(/[#/:]/).at(-1)}`;
  const classTerms = input.classes.map(
    (klass) => [klass.uri, nameTerm(klass.uri, klass.prefix)] as const,
  );
  const relationTerms = input.relations.map((relation) => {
    const base = relation.uri.replace(/[^#/:]+$/, "");
    const prefix =
      input.classes.find((klass) => klass.uri.startsWith(base))?.prefix ?? base;
    return [relation.uri, nameTerm(relation.uri, prefix)] as const;
  });
  return new Map([...classTerms, ...relationTerms]);
}
