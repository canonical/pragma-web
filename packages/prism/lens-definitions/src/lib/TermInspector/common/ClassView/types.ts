import type { TermInspector_class$data } from "../../../../__generated__/TermInspector_class.graphql.js";
import type { OntologyNamespace } from "../../../types.js";

/** Props accepted by `ClassView`. */
export interface ClassViewProps {
  /** The class the term resolved to. */
  readonly data: TermInspector_class$data;
  /** The term's compact address, as the URL carries it. */
  readonly term: string;
  /** The ontologies' (prefix, namespace) pairs, for compacting IRIs. */
  readonly namespaces: readonly OntologyNamespace[];
}
