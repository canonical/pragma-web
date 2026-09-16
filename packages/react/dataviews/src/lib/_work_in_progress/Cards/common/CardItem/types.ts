import type {
  Applicability,
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { RowChannels } from "@canonical/dataviews-core/bindings";
import type { DisplayField } from "../../../../common/index.js";

/**
 * Props of one record's card.
 *
 * Exempt from the native-prop extension convention: an internal renderer
 * deriving its root from the record's channels and the declared fields, not
 * forwarding a caller's native props.
 */
export type CardItemProps<TRow extends object> = {
  /**
   * What the card and the fields it draws read of the provider: the
   * collection a field's scope is witnessed by, and the selection its
   * checkbox toggles. Only those, so a provider typed over its own field
   * list is one of these without being widened.
   */
  readonly provider: Pick<
    DataViewsProvider<readonly SchemaFieldDefinition[], TRow>,
    "collection" | "selection"
  >;
  /** The record's row channels, from the cards' row scopes. */
  readonly channels: RowChannels<TRow>;
  /** The field heading the card and naming it. */
  readonly title: DisplayField;
  /** The fields listed beneath the title, in order. */
  readonly details: readonly DisplayField[];
  /** Offer the card's selection checkbox. */
  readonly selectable: boolean;
  /**
   * Names the record for its checkbox, or answers null to leave it named by
   * its title field's text, and by its identity where that holds no text.
   */
  readonly nameRecord: (row: TRow, rowId: string) => string | null;
  /**
   * Whether one field applies to one record. The cards', one identity for
   * every card, asked per field the card shows.
   */
  readonly applicabilityOf: (field: string, record: TRow) => Applicability;
};
