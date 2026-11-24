import type {
  Collection,
  FieldNameOf,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { FunctionComponent, ReactNode } from "react";
import type { DisplayFieldCellProps } from "../../../../../common/index.js";
import { readColumnRegistry } from "../../../../../utils/index.js";
import type { DataTableColumn } from "./common/index.js";

/** The members of a record union that declare a name. */
type Declaring<TUnion, TName> = TUnion extends unknown
  ? TName extends keyof TUnion
    ? TUnion
    : never
  : never;

/**
 * What a record reads at a name it does not declare: `undefined` where
 * another member of its union declares it, `unknown` where none does.
 */
type Missing<TUnion, TName> = [Declaring<TUnion, TName>] extends [never]
  ? unknown
  : undefined;

/** What a path through an optional or nullable member may also read. */
type Absent<TMember> = undefined extends TMember
  ? undefined
  : null extends TMember
    ? undefined
    : never;

/** The keys a record declares, less its index signatures. */
type OwnKeys<TRow> = keyof {
  [K in keyof TRow as string extends K
    ? never
    : number extends K
      ? never
      : K]: TRow[K];
};

/** `undefined` where only an index signature matches the name. */
type Unchecked<TRow, TName> = TName extends OwnKeys<TRow> ? never : undefined;

/** What a path reads past one segment: `undefined` past a primitive. */
type Through<TValue, TRest extends string> = TValue extends object
  ? ValueAt<TValue, TRest>
  : undefined;

/**
 * The value one field of a record carries, by name or by dot path; a name
 * holding a dot is a path, as the reader reads it. Distributed over a union
 * of record types, so a field only one type carries reads as that type's
 * value or `undefined`.
 */
type ValueAt<TRow, TName extends string, TUnion = TRow> = TRow extends unknown
  ? TName extends `${infer THead}.${infer TRest}`
    ? THead extends keyof TRow
      ?
          | Through<NonNullable<TRow[THead]>, TRest>
          | Absent<TRow[THead]>
          | Unchecked<TRow, THead>
      : Missing<TUnion, THead>
    : TName extends keyof TRow
      ? TRow[TName] | Unchecked<TRow, TName>
      : Missing<TUnion, TName>
  : never;

/** `undefined` where the field's definition scopes it to some record types. */
type Scoped<
  TFields extends readonly SchemaFieldDefinition[],
  TName extends string,
> = "appliesTo" extends keyof Extract<
  TFields[number],
  { readonly field: TName }
>
  ? undefined
  : never;

/** The members every column takes, whatever it shows. */
type ColumnMembers<TRow extends object> = Omit<
  DataTableColumn<TRow>,
  "id" | "field" | "header" | "cell"
> & {
  /** The column's heading. */
  readonly header: ReactNode;
};

/** One declared column over one field, its content typed by that field. */
type TypedColumnOf<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object,
  TName extends string,
> = ColumnMembers<TRow> & {
  /** The collection field the column shows. */
  readonly field: TName;
  /** The column's identity; the field's name unless two columns show it. */
  readonly id?: string;
  /** The column's own content, handed its field's value at its type. */
  readonly cell?: FunctionComponent<
    DisplayFieldCellProps<ValueAt<TRow, TName> | Scoped<TFields, TName>, TRow>
  >;
};

/** A column over no field of the collection, drawing its record. */
type ExtraColumn<TRow extends object> = ColumnMembers<TRow> & {
  readonly field?: never;
  /** The column's identity. */
  readonly id: string;
  /** The column's content, handed the record. */
  readonly cell: FunctionComponent<DisplayFieldCellProps<unknown, TRow>>;
};

/** One declared column over whichever of the collection's fields it shows. */
type TypedColumn<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object,
> =
  | {
      [TName in FieldNameOf<TFields>]: TypedColumnOf<TFields, TRow, TName>;
    }[FieldNameOf<TFields>]
  | ExtraColumn<TRow>;

/**
 * Declare a table's columns over the collection they show: a frozen list
 * whose columns name the collection's fields, each content typed by its
 * field, and extra columns that name an id and draw their record. `id`
 * defaults to the field.
 *
 * `import { createColumns } from "@canonical/dataviews-react";`
 *
 * @throws When two columns share an id, or an extra column's id names a
 * field of the collection.
 *
 * @note Impure: records the list against its collection in the column
 * registry.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function createColumns<
  const TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>({
  collection,
  columns,
}: {
  /** The collection the columns show. */
  readonly collection: Collection<TFields, TRow>;
  /** The columns, in declared order. */
  readonly columns: readonly TypedColumn<TFields, TRow>[];
}): readonly DataTableColumn<TRow>[] {
  const ids = new Set<string>();
  const declared = Object.freeze(
    columns.map((column): DataTableColumn<TRow> => {
      const { cell, field, header, hideable, id, resizable, sizing, sortable } =
        column;
      const named = (id ?? field) as string; // An extra column requires its id.
      if (ids.has(named)) {
        throw new Error(
          `createColumns names two columns "${named}"; give the second an id of its own`,
        );
      }
      ids.add(named);
      if (
        field === undefined &&
        collection.schema.findField(named) !== undefined
      ) {
        throw new Error(
          `createColumns names an extra column "${named}", a field of the collection; give it the field or another id`,
        );
      }
      // Each optional member only where given: under exact optional
      // property types a column holds no `undefined` member.
      return Object.freeze({
        header,
        ...(field === undefined ? {} : { field }),
        id: named,
        ...(sizing === undefined ? {} : { sizing }),
        ...(hideable === undefined ? {} : { hideable }),
        ...(sortable === undefined ? {} : { sortable }),
        ...(resizable === undefined ? {} : { resizable }),
        // The renderer hands a cell its field's value, or undefined where
        // the field does not apply, which `Scoped` adds to the type.
        ...(cell === undefined
          ? {}
          : {
              cell: cell as FunctionComponent<
                DisplayFieldCellProps<unknown, TRow>
              >,
            }),
      });
    }),
  );
  readColumnRegistry().set(declared, collection);
  return declared;
}
