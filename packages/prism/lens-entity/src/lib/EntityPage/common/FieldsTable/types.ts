import type { ComponentProps } from "react";
import type { FieldsTable_meta$key } from "../../../../__generated__/FieldsTable_meta.graphql.js";
import type { OntologyNamespace } from "../../../types.js";

type OwnProps = {
  /** The entity's self-description, as a fragment key. */
  readonly meta: FieldsTable_meta$key;
  /** The graph's namespaces, which compact the property IRIs. */
  readonly namespaces: readonly OntologyNamespace[];
};

/**
 * Props accepted by `FieldsTable`: the entity's description and the graph's
 * namespaces, and the native props of its `<section>` root. The native
 * `children` are excluded: the table renders the class's fields.
 */
export type FieldsTableProps = OwnProps &
  Omit<ComponentProps<"section">, keyof OwnProps | "children">;
