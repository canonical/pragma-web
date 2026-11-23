import type {
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { RowChannels } from "@canonical/dataviews-core/bindings";
import type { ComponentProps } from "react";
import type { DisplayField } from "../../../../common/index.js";

type OwnProps<TRow extends object> = {
  /** The provider whose selection the card's checkbox toggles. */
  readonly provider: DataViewsProvider<readonly SchemaFieldDefinition[], TRow>;
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
};

/**
 * Props of one record's card. Its root is the design system's Card, a `div`,
 * so it extends native div props, less those the card owns: `children`, its
 * record's fields; `role`, a list item; and its name.
 */
export type CardItemProps<TRow extends object> = OwnProps<TRow> &
  Omit<
    ComponentProps<"div">,
    | keyof OwnProps<TRow>
    | "children"
    | "role"
    | "aria-label"
    | "aria-labelledby"
  >;
