/**
 * The field declaration every renderer shows a record by, and the props a
 * field's own content receives. Together because a field's `cell` is typed by
 * the props every renderer hands it, whichever renderer draws it.
 */

import type { Applicability } from "@canonical/dataviews-core";
import type { ComponentType, ReactNode } from "react";

/**
 * The props one field's content receives, in whichever renderer draws it:
 * untyped where a field is declared by hand, and typed by the collection —
 * the value at its field's own type, the record at the record's — where it
 * is declared through `createColumns`.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type DisplayFieldCellProps<TValue = unknown, TRow = unknown> = {
  /** The field's current value. */
  readonly value: TValue;
  /**
   * The record the value was read from, at its current type: what content
   * narrows on to read a field only one type carries. The content renders
   * again when its own field's value changes or the record's type does, and
   * for nothing else, which is the renderer's guarantee; content drawing
   * other fields of the record as they move watches them through
   * `useDataViewsCell`.
   */
  readonly record: TRow;
  /**
   * Whether this field applies to the record's type. A field scoped to
   * other types is not empty but a third state; content given one may draw
   * it however it likes, and content that ignores it draws the value, which
   * for such a record there is none of.
   */
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
export type DisplayField = {
  /** The field's identity, unique within its renderer. */
  readonly id: string;
  /** The field's heading. */
  readonly header: ReactNode;
  /** The record field shown. Defaults to the id. */
  readonly field?: string;
  /**
   * The record types this field applies to, narrower than its schema field's
   * own scope: in a record of any other type it draws the not-applicable
   * state, and a table's heading names these types. Each must be a type the
   * collection declares and, where the schema field is scoped, one it applies
   * to; a field naming any other fails where the renderer is mounted, since
   * it would otherwise draw every value not applicable and say nothing.
   */
  readonly appliesTo?: readonly string[];
  /**
   * Field-specific content. Rendered inside the cell's scope, so it may call
   * `useDataViewsCell` for the row's channels. Without one, primitive values
   * render as text and every other value renders nothing.
   */
  readonly cell?: ComponentType<DisplayFieldCellProps>;
};
