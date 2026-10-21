import type { OntologyNamespace } from "../../../types.js";

/** Props accepted by `Lineage`. */
export interface LineageProps {
  /** The class's own name, the chain's plain-text leaf. */
  readonly self: string;
  /** The class's ancestors, nearest first. */
  readonly ancestors: readonly {
    readonly uri: string;
    readonly label: string | null | undefined;
  }[];
  /** The ontologies' (prefix, namespace) pairs, for compacting IRIs. */
  readonly namespaces: readonly OntologyNamespace[];
}
