/**
 * Read the namespace prefix of a compact address, with its colon: `cs:` for
 * `cs:code.array.safe_access`. An address with no prefix, such as an
 * absolute IRI the graph could not compact, has none.
 *
 * @param curie - The entity's compact address.
 * @returns The prefix and its colon, or `undefined` when there is none.
 */
export default function readCuriePrefix(curie: string): string | undefined {
  return /^[A-Za-z][\w.-]*:(?!\/\/)/.exec(curie)?.at(0);
}
