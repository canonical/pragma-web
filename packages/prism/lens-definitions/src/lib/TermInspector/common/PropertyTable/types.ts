import type { ComponentProps } from "react";
import type { TermInspector_class$data } from "../../../../__generated__/TermInspector_class.graphql.js";
import type { OntologyNamespace } from "../../../types.js";

type OwnProps = {
  /** The properties to list, one row each. */
  readonly properties: readonly TermInspector_class$data["properties"][number][];
  /** The ontologies' (prefix, namespace) pairs, for compacting IRIs. */
  readonly namespaces: readonly OntologyNamespace[];
};

/**
 * Props accepted by `PropertyTable`: the properties it lists, and the native
 * props of its root `<table>`.
 */
export type PropertyTableProps = OwnProps &
  Omit<ComponentProps<"table">, keyof OwnProps>;
