import type { ReactNode } from "react";
import type { EntityChip_node$key } from "../../../__generated__/EntityChip_node.graphql.js";
import type { ProseReferencesProvider_references$key } from "../../../__generated__/ProseReferencesProvider_references.graphql.js";

/**
 * A page's prose references, keyed by every address an author may write for
 * one: its absolute IRI and its compact form.
 */
export type ProseReferenceIndex = ReadonlyMap<string, EntityChip_node$key>;

/** The part of a referenced node the index reads: its two addresses. */
export interface ProseReferenceNode {
  /** The node's absolute IRI. */
  readonly uri: string;
  readonly _meta: {
    /** The node's compact address, `prefix:local`. */
    readonly curie: string;
  };
}

/** Props accepted by `ProseReferencesProvider`. */
export interface ProseReferencesProviderProps {
  /** The nodes the page's prose links to, as a fragment key. */
  readonly references: ProseReferencesProvider_references$key;
  /** The prose whose links resolve against the references. */
  readonly children: ReactNode;
}
