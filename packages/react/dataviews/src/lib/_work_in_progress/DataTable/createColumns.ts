import type {
  Collection,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { FieldNameOf } from "@canonical/dataviews-core/bindings";
import type { ComponentType, ReactNode } from "react";
import type { DisplayFieldCellProps } from "../../common/index.js";
import type { DataTableColumn } from "./types.js";

/**
 * What a record carries at a name it does not declare: `unknown` where the
 * record describes no names at all — the default row shape — and `undefined`
 * where it describes its names and this is not one of them, which is what a
 * row reads there.
 */
type Missing<TRow> = string extends keyof TRow ? unknown : undefined;

/**
 * What a path through an optional or nullable member may also be: nothing,
 * where the member is absent, which a row reads as `undefined`.
 */
type Absent<TMember> = undefined extends TMember
  ? undefined
  : null extends TMember
    ? undefined
    : never;

/**
 * The value one field of a record carries, by name or by dot path.
 *
 * A path is walked one own key at a time, as a row is read: `config.region`
 * is the type at `region` of the type at `config`, or `undefined` where
 * `config` may be absent. Distributed over a record that is a union of
 * types, so a field only one type carries is that type's value or
 * `undefined` — the not-applicable case — rather than the `unknown` a name
 * no type carries would be.
 */
type ValueAt<TRow, TName extends string> = TRow extends unknown
  ? TName extends keyof TRow
    ? TRow[TName]
    : TName extends `${infer THead}.${infer TRest}`
      ? THead extends keyof TRow
        ? ValueAt<NonNullable<TRow[THead]>, TRest> | Absent<TRow[THead]>
        : Missing<TRow>
      : Missing<TRow>
  : never;

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
  readonly cell?: ComponentType<
    DisplayFieldCellProps<ValueAt<TRow, TName>, TRow>
  >;
};

/** One declared column of a collection: whichever of its fields it shows. */
type TypedColumn<
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
  const ids = new Set<string>();
  return Object.freeze(
    columns.map((column): DataTableColumn => {
      const named = column.id ?? column.field;
      // Two columns over one field are told apart by the id the caller
      // gives; without one they would share a key, a track and a scope.
      if (ids.has(named)) {
        throw new Error(
          `createColumns names two columns "${named}"; give the second an id of its own`,
        );
      }
      ids.add(named);
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
      // Each optional member is given only when the declaration carries one.
      // A rest spread would be shorter, but over the union of typed columns
      // the compiler widens every optional member to admit `undefined`, which
      // a column under exact optional property types does not.
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
