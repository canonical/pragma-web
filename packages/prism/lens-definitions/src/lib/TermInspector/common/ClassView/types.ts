import type { ComponentProps } from "react";
import type { TermInspector_class$data } from "../../../../__generated__/TermInspector_class.graphql.js";
import type { OntologyNamespace } from "../../../types.js";

type OwnProps = {
  /** The class the term resolved to. */
  readonly data: TermInspector_class$data;
  /** The term's compact address, as the URL carries it. */
  readonly term: string;
  /** The ontologies' (prefix, namespace) pairs, for compacting IRIs. */
  readonly namespaces: readonly OntologyNamespace[];
};

/**
 * Props accepted by `ClassView`: the class it shows, and the native props of
 * its root `<article>`.
 */
export type ClassViewProps = OwnProps &
  Omit<ComponentProps<"article">, keyof OwnProps>;
