import type { ComponentProps } from "react";
import type { TermInspector_property$data } from "../../../../__generated__/TermInspector_property.graphql.js";
import type { OntologyNamespace } from "../../../types.js";

type OwnProps = {
  /** The property the term resolved to. */
  readonly data: TermInspector_property$data;
  /** The term's compact address, as the URL carries it. */
  readonly term: string;
  /** The ontologies' (prefix, namespace) pairs, for compacting IRIs. */
  readonly namespaces: readonly OntologyNamespace[];
};

/**
 * Props accepted by `PropertyView`: the property it shows, and the native
 * props of its root `<article>`.
 */
export type PropertyViewProps = OwnProps &
  Omit<ComponentProps<"article">, keyof OwnProps>;
