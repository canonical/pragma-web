import {
  LINK_SCHEME_PATTERN,
  REFUSED_LINK_SCHEMES,
} from "@canonical/react-markdown";

/** The part of a reference `listLinkSchemes` reads: its compact address. */
interface ReferenceEdge {
  readonly node: { readonly _meta: { readonly curie: string } };
}

/**
 * List the URL schemes the prose's links may keep for its references to
 * render as chips: the prefix of each reference's compact address
 * (`cs:code.array.safe_access` gives `cs`), without repeats and sorted, so
 * the server and the browser compute the same list. A prefix that cannot be
 * a link scheme, or one Markdown refuses to keep, is left out: a link
 * written with it stays a plain link.
 *
 * @param edges - The edges of the prose's references.
 * @returns The schemes, sorted by code point.
 */
export default function listLinkSchemes(
  edges: readonly ReferenceEdge[],
): string[] {
  // An address with no colon has no prefix: it reads as the empty one,
  // which no scheme matches.
  const schemes = new Set(
    edges.map(({ node }) => {
      const { curie } = node._meta;
      return curie.slice(0, Math.max(curie.indexOf(":"), 0));
    }),
  );
  return [...schemes]
    .filter((scheme) => LINK_SCHEME_PATTERN.test(scheme))
    .filter(
      (scheme) => !REFUSED_LINK_SCHEMES.some((refused) => refused === scheme),
    )
    .sort();
}
