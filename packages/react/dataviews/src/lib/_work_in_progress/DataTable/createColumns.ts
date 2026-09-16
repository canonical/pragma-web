import type {
  Applicability,
  Collection,
  FieldNameOf,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { ComponentType, ReactNode } from "react";
import type { DisplayFieldCellProps } from "../../common/index.js";
import type { DataTableColumn } from "./types.js";

/**
 * The value one field of a record carries, by name or by dot path.
 *
 * A path is walked one own key at a time, as a row is read: `config.region`
 * is the type at `region` of the type at `config`. A name the record does not
 * describe — the default row shape describes none — carries `unknown`, which
 * is what a cell over such a field is handed.
 */
type ValueAt<TRow, TName extends string> = TName extends keyof TRow
  ? TRow[TName]
  : TName extends `${infer THead}.${infer TRest}`
    ? THead extends keyof TRow
      ? ValueAt<NonNullable<TRow[THead]>, TRest>
      : unknown
    : unknown;

/**
 * The props a typed column's own content receives: its field's value at the
 * type the record carries, and the row and column it is drawn in.
 *
 * Structurally the props every renderer hands a display field's content, so a
 * component written for one renders unchanged in another; what a typed column
 * adds is the value's type.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type TypedCellProps<TValue, TRow> = {
  /** The field's current value, typed from the record. */
  readonly value: TValue;
  /**
   * The whole record the value was read from, at its own type, as it stood
   * when this content rendered: what content narrows on to read a field only
   * one type carries. Content renders when its own field's value changes;
   * content that draws other fields subscribes through `useDataViewsCell`.
   */
  readonly record: TRow;
  /**
   * Whether this column's field applies to the record's type. Content given
   * a record the field does not apply to may draw it however it likes;
   * content that ignores this draws a value there is none of.
   */
  readonly applicability: Applicability;
  /** The row's stable identity. */
  readonly rowId: string;
  /** The declaring column's identity. */
  readonly columnId: string;
};

/**
 * One column as it is declared: the table's own members, plus the field it
 * shows and the content that draws it, both typed against the collection.
 *
 * `field` names the collection's own field, so a misspelt one does not
 * compile; `id` defaults to it, and is given only where two columns show one
 * field. Written as a union over the field names so that `cell` is typed by
 * the field beside it rather than by every field at once.
 */
type TypedColumnOf<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object,
  TName extends FieldNameOf<TFields>,
> = Omit<DataTableColumn, "id" | "field" | "header" | "cell"> & {
  /** The collection field this column shows. */
  readonly field: TName;
  /** The column's identity; the field's name unless two columns show one field. */
  readonly id?: string;
  /** The column's heading. */
  readonly header: ReactNode;
  /** Content for this column's value, typed by the field it shows. */
  readonly cell?: ComponentType<TypedCellProps<ValueAt<TRow, TName>, TRow>>;
};

/**
 * One declared column of a collection: whichever of its fields it shows.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type TypedColumn<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = {
  [TName in FieldNameOf<TFields>]: TypedColumnOf<TFields, TRow, TName>;
}[FieldNameOf<TFields>];

/**
 * Declare a table's columns over the collection they show.
 *
 * The collection is the witness: every column names one of its fields, so a
 * misspelt field does not compile, and a column's own content is handed its
 * field's value at the type the record carries rather than `unknown`. A
 * nested field is named by its dot path, and its value is the type at the end
 * of that path.
 *
 * It builds data, not components: it reads no provider and holds no state, so
 * it is called once at module scope beside the collection, and the columns it
 * returns are given to any table over that collection — and to any other
 * renderer, since what a column adds to a display field is the table's own.
 *
 * Whether a source can order by a column's field is not knowable here: the
 * declaration belongs to the source, which a provider carries, so a column
 * marked `sortable` is checked against it where the table is mounted.
 *
 * `import { createColumns } from "@canonical/dataviews-react";`
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function createColumns<
  const TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>(
  _collection: Collection<TFields, TRow>,
  columns: readonly TypedColumn<TFields, TRow>[],
): readonly DataTableColumn[] {
  return Object.freeze(
    columns.map((column): DataTableColumn => {
      const {
        appliesTo,
        cell,
        field,
        header,
        id,
        hideable,
        resizable,
        rowHeader,
        sizing,
        sortable,
      } = column;
      // Each optional member is given only when the declaration carries one:
      // spreading them wholesale would offer `undefined` where the column
      // says a member may be absent, which is a different statement.
      return Object.freeze({
        header,
        field,
        id: id ?? field,
        ...(appliesTo === undefined ? {} : { appliesTo }),
        ...(rowHeader === undefined ? {} : { rowHeader }),
        ...(sizing === undefined ? {} : { sizing }),
        ...(hideable === undefined ? {} : { hideable }),
        ...(sortable === undefined ? {} : { sortable }),
        ...(resizable === undefined ? {} : { resizable }),
        // A typed column's content reads its own field's value; the props
        // every renderer hands a cell say `unknown`, because one renderer
        // draws every field. A component accepting less than its props
        // promise is not one the compiler can substitute, so the narrowing is
        // asserted here — the one place it is made — rather than by each
        // caller. What makes it hold is the table: the cell it draws is
        // handed the value of the field named beside it in this declaration.
        ...(cell === undefined
          ? {}
          : { cell: cell as ComponentType<DisplayFieldCellProps> }),
      });
    }),
  );
}
