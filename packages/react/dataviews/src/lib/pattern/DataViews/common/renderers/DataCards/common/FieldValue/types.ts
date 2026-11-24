import type {
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type {
  ProviderHost,
  RowChannels,
} from "@canonical/dataviews-core/bindings";
import type { DisplayField } from "../../../../../../../common/index.js";

/** Props of one field's value on a card. */
export type FieldValueProps<TRow extends object> = {
  /** The provider's collection, which witnesses the field's scope. */
  readonly provider: Pick<
    DataViewsProvider<readonly SchemaFieldDefinition[], TRow>,
    "collection"
  >;
  /** The card's row channels, from the cards' row scopes. */
  readonly channels: RowChannels<TRow>;
  /** The field shown. */
  readonly field: DisplayField<TRow>;
  /** Whether a field applies to a record, from the provider's host. */
  readonly readApplicability: ProviderHost<
    readonly SchemaFieldDefinition[],
    TRow
  >["readApplicability"];
};
