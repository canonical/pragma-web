/**
 * The field declaration every renderer shows a record by, and the props a
 * field's own content receives. Together because a field's `cell` is typed by
 * the props every renderer hands it, whichever renderer draws it.
 */

import type { Applicability, RowRecord } from "@canonical/dataviews-core";
import type { FunctionComponent, ReactNode } from "react";

/**
 * The props one field's content receives, in whichever renderer draws it:
 * the field's value, typed `TValue`, and the record it was read from, typed
 * `TRow`.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type DisplayFieldCellProps<
  TValue = unknown,
  TRow extends object = RowRecord,
> = {
  /**
   * The field's current value; undefined where the field does not apply to
   * the record's type.
   */
  readonly value: TValue;
  /**
   * The whole record. The content renders again whenever a field of the
   * record moves.
   */
  readonly record: TRow;
  /** Whether the field applies to the record's type. */
  readonly applicability: Applicability;
  /** The row's stable identity. */
  readonly rowId: string;
  /** The declaring field's identity: a table's column, a card's field. */
  readonly columnId: string;
};

/**
 * One field a renderer shows. Field meaning supplies the default content;
 * `cell` supplies the exceptional content — a badge, a link, an action menu —
 * for the one field that needs it, without making the caller author every
 * header and value. A table's column is one, with what a column adds.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type DisplayField<TRow extends object = RowRecord> = {
  /** The field's identity, unique within its renderer. */
  readonly id: string;
  /** The field's heading. */
  readonly header: ReactNode;
  /** The record field shown. Defaults to the id. */
  readonly field?: string;
  /**
   * Field-specific content, handed the value and the record. Without one,
   * primitive values render as text, every other value renders nothing,
   * and a field that does not apply to the record draws a dash.
   */
  readonly cell?: FunctionComponent<DisplayFieldCellProps<unknown, TRow>>;
};
