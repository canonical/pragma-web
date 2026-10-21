import type { TermInspector_class$data } from "../../../../__generated__/TermInspector_class.graphql.js";
import type { OntologyNamespace } from "../../../types.js";

/** Props accepted by `PropertyTable`. */
export interface PropertyTableProps {
  /** The properties to list, one row each. */
  readonly properties: readonly TermInspector_class$data["properties"][number][];
  /** The ontologies' (prefix, namespace) pairs, for compacting IRIs. */
  readonly namespaces: readonly OntologyNamespace[];
}
