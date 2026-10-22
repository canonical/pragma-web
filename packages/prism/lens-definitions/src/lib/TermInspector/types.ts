import type { ComponentProps } from "react";
import type { TermInspector_class$key } from "../../__generated__/TermInspector_class.graphql.js";
import type { TermInspector_property$key } from "../../__generated__/TermInspector_property.graphql.js";
import type { OntologyNamespace } from "../types.js";

type OwnProps = {
  /** The selected term (prefixed URI), or undefined on `/definitions`. */
  readonly term: string | undefined;
  /** Fragment ref of the class the term resolved to, when it is one. */
  readonly classRef: TermInspector_class$key | null | undefined;
  /** Fragment ref of the property the term resolved to, when it is one. */
  readonly propertyRef: TermInspector_property$key | null | undefined;
  /** The ontologies' (prefix, namespace) pairs, for prefixing full IRIs. */
  readonly namespaces: readonly OntologyNamespace[];
};

/**
 * Props accepted by `TermInspector`: the selected term and the class or
 * property it resolved to, and the native props of its root `<aside>`.
 */
export type TermInspectorProps = OwnProps &
  Omit<ComponentProps<"aside">, keyof OwnProps>;
