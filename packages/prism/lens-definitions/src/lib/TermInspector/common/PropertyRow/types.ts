import type { TermInspector_class$data } from "../../../../__generated__/TermInspector_class.graphql.js";
import type { OntologyNamespace } from "../../../types.js";

/** Props accepted by `PropertyRow`. */
export interface PropertyRowProps {
  /** One property the class carries, with its cardinality flags. */
  readonly classProperty: TermInspector_class$data["properties"][number];
  /** The ontologies' (prefix, namespace) pairs, for compacting IRIs. */
  readonly namespaces: readonly OntologyNamespace[];
}
