import type {
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { RowChannels } from "@canonical/dataviews-core/bindings";
import type { DisplayField } from "../../../../common/index.js";

/**
 * Props of one field's value on a card.
 *
 * Exempt from the native-prop extension convention: it has no single native
 * root, rendering the field's text, or the field's own `cell`, with no
 * element of its own.
 */
export type FieldValueProps<TRow extends object> = {
  /** The provider whose collection the cell scope names. */
  readonly provider: DataViewsProvider<readonly SchemaFieldDefinition[], TRow>;
  /** The card's row channels, from the cards' row scopes. */
  readonly channels: RowChannels<TRow>;
  /** The field shown. */
  readonly field: DisplayField;
};
