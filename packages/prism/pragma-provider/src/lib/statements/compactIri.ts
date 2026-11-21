/**
 * An IRI's compact form: the prefix of the longest namespace it starts
 * with, then the rest, or the whole IRI when no namespace matches. Pure.
 *
 * @param uri - An absolute IRI.
 * @param prefixes - Each namespace IRI, by prefix.
 * @returns `prefix:local`, or `uri`.
 */
export const compactIri = (
  uri: string,
  prefixes: ReadonlyMap<string, string>,
): string => {
  const match = [...prefixes]
    .filter(([, namespace]) => uri.startsWith(namespace))
    .toSorted(([, a], [, b]) => b.length - a.length)
    .at(0);
  return match === undefined
    ? uri
    : `${match[0]}:${uri.slice(match[1].length)}`;
};
