import type {
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type {
  DisplayEntry,
  RowChannels,
} from "@canonical/dataviews-core/bindings";
import type { ComponentProps } from "react";
import type { DisplayField } from "../../../../common/index.js";

/** One record's entry, as the core lists the ones it displays. */
type RecordEntry = Extract<DisplayEntry, { readonly kind: "record" }>;

type OwnProps<TRow extends object> = {
  /** The provider whose selection the cards' checkboxes toggle. */
  readonly provider: DataViewsProvider<readonly SchemaFieldDefinition[], TRow>;
  /** The record entries the core displays, in its order. */
  readonly records: readonly RecordEntry[];
  /** One record's channels, by its identity. */
  readonly readRow: (rowId: string) => RowChannels<TRow>;
  /** The field heading each card and naming it. */
  readonly title: DisplayField;
  /** The fields listed beneath the title, in order. */
  readonly details: readonly DisplayField[];
  /** Offer each card's selection checkbox. */
  readonly selectable: boolean;
  /**
   * Names a record for its checkbox, or answers null to leave it named by
   * its title field's text.
   */
  readonly nameRecord: (row: TRow, rowId: string) => string | null;
};

/**
 * Props of the list of cards. Its root is the `div` carrying the grid the
 * Cards group takes its columns from, so it extends native div props, less
 * `children`, the cards it renders.
 */
export type CardListProps<TRow extends object> = OwnProps<TRow> &
  Omit<ComponentProps<"div">, keyof OwnProps<TRow> | "children">;
