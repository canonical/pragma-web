import type { TermInspector_property$data } from "../../../../__generated__/TermInspector_property.graphql.js";
import type { OntologyNamespace } from "../../../types.js";

/** Props accepted by `PropertyView`. */
export interface PropertyViewProps {
  /** The property the term resolved to. */
  readonly data: TermInspector_property$data;
  /** The term's compact address, as the URL carries it. */
  readonly term: string;
  /** The ontologies' (prefix, namespace) pairs, for compacting IRIs. */
  readonly namespaces: readonly OntologyNamespace[];
}
