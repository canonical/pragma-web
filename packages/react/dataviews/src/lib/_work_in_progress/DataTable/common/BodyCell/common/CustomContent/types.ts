import type { Applicability } from "@canonical/dataviews-core";
import type { RowChannels } from "@canonical/dataviews-core/bindings";
import type { ComponentType } from "react";
import type { DisplayFieldCellProps } from "../../../../../../common/index.js";

/** Props of a column's own content, as a cell renders it. */
export type CustomContentProps<TRow extends object> = {
  /** The column's own content component. */
  readonly Content: ComponentType<DisplayFieldCellProps>;
  /** The row's channels, whose record the content is handed. */
  readonly channels: RowChannels<TRow>;
  /** The channel of the one field the column shows. */
  readonly channel: RowChannels<TRow>["fields"][string];
  /** The declaring column's identity. */
  readonly columnId: string;
  /** Whether the column applies to the row's record. */
  readonly applicability: Applicability;
};
