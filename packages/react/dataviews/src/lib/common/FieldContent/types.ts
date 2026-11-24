import type { SchemaFieldDefinition } from "@canonical/dataviews-core";
import type {
  ProviderHost,
  RowChannels,
} from "@canonical/dataviews-core/bindings";
import type { DisplayField } from "../DisplayField/index.js";

/** Props of one field's content, in a table's cell or on a card. */
export type FieldContentProps<TRow extends object> = {
  /** The record's row channels. */
  readonly channels: RowChannels<TRow>;
  /** The field's name on the record; its channel is in `channels`. */
  readonly field: string;
  /** The declaring field's identity: a table's column, a card's field. */
  readonly columnId: string;
  /** The field's own content; left out, the default text. */
  readonly cell: DisplayField<TRow>["cell"];
  /** Whether a field applies to a record, from the provider's host. */
  readonly readApplicability: ProviderHost<
    readonly SchemaFieldDefinition[],
    TRow
  >["readApplicability"];
};
