import type { LinkComponent } from "@canonical/react-ds-global";
/**
 * What `useProjectionLink` returns: the link the nearest provider renders a
 * node's home through.
 */
export type UseProjectionLinkResult = LinkComponent;

/**
 * What `useForeignPrefix` returns: a namespace prefix with its colon, or
 * `undefined` when the identity shows none.
 */
export type UseForeignPrefixResult = string | undefined;

/**
 * What `useForeignPrefix` reads a node's prefix from: its compact address,
 * `_meta.curie`, or, for an entity with no `_meta`, the namespace the
 * contract serves for it, a prefix name or an IRI.
 */
export type ForeignPrefixSource = string | { readonly namespace: string };
