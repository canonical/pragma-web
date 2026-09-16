import type {
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { RowChannels } from "@canonical/dataviews-core/bindings";
import type { DisplayField } from "../../../../common/index.js";

/**
 * Props of one field's value on a card.
 *
 * Exempt from the native-prop extension convention: it renders the field's
 * content, or the field's own `cell`, with no element of its own to forward
 * a caller's props to.
 */
export type FieldValueProps<TRow extends object> = {
  /**
   * What the field reads of the provider: the collection its cell scope is
   * witnessed by. Only that, so a provider typed over its own field list is
   * one of these without being widened.
   */
  readonly provider: Pick<
    DataViewsProvider<readonly SchemaFieldDefinition[], TRow>,
    "collection"
  >;
  /** The card's row channels, from the cards' row scopes. */
  readonly channels: RowChannels<TRow>;
  /** The field shown. */
  readonly field: DisplayField;
};
