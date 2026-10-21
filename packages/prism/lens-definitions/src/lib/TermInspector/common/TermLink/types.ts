import type { OntologyNamespace } from "../../../types.js";

/** Props accepted by `TermLink`. */
export interface TermLinkProps {
  /** The related term's full IRI. */
  readonly uri: string;
  /** The graph's label for it, if any; the compact address stands in otherwise. */
  readonly label: string | null | undefined;
  /** The ontologies' (prefix, namespace) pairs, for compacting the IRI. */
  readonly namespaces: readonly OntologyNamespace[];
}
