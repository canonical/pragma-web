import type { Applicability } from "@canonical/dataviews-core";
import type { RowChannels } from "@canonical/dataviews-core/bindings";
import type { ComponentType } from "react";
import type { DisplayFieldCellProps } from "../DisplayField/index.js";

/**
 * Props of a field's own content, as a cell or a card renders it.
 *
 * Exempt from the native-prop extension convention: it renders the field's
 * own component, with no element of its own to forward a caller's props to.
 */
export type CustomContentProps<TRow extends object> = {
  /** The field's own content component. */
  readonly Content: ComponentType<DisplayFieldCellProps>;
  /** The record's channels, whose record the content is handed. */
  readonly channels: RowChannels<TRow>;
  /** The channel of the one field shown. */
  readonly channel: RowChannels<TRow>["fields"][string];
  /** The declaring field's identity. */
  readonly columnId: string;
  /** Whether the field applies to the record. */
  readonly applicability: Applicability;
};
