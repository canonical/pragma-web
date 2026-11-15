import type {
  DataViewsMessages,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { ReactNode } from "react";
import type { AnnouncerTopic } from "../../../../common/index.js";
import type { DataTableProps } from "../../types.js";

/**
 * Props of the table's body within its UI scope: the table's own, with the
 * words and the announcer it speaks through supplied rather than resolved —
 * by a standalone table from its own, by a connected one from its root.
 * Never exported from the package: it is how the two tables share one body.
 */
export type ScopedDataTableProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = Omit<DataTableProps<TFields, TRow>, "messages"> & {
  /** Every message the table renders and announces, resolved. */
  readonly messages: DataViewsMessages;
  /** Say an outcome through the announcer of the table's UI scope. */
  readonly announce: (message: ReactNode, topic?: AnnouncerTopic) => void;
};
