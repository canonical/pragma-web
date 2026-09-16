/**
 * Types the shared utilities take and answer: what a declared column or field
 * knows of record types, as the renderers read it.
 */

import type {
  Applicability,
  Collection,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { DisplayField } from "../common/index.js";

/** What one declared column or field knows of record types. */
export type FieldScope = {
  /**
   * The types it applies to, resolved: its own narrowing where it declares
   * one, else its schema field's scope, or null where it applies to every
   * record. What a table's heading names.
   */
  readonly scope: readonly string[] | null;
  /** Whether it applies to a record of the given declared type, or of none. */
  readonly applicability: (type: string | null) => Applicability;
};

/** One declared column's or field's scope, by the column or field. */
export type FieldScopes = (column: DisplayField) => FieldScope;

/**
 * What `readFieldScopes` reads: the collection the fields show, the fields,
 * and what the renderer calls one of them.
 */
export type ReadFieldScopesConfig = {
  /** The collection whose declared types and scoped fields are read. */
  readonly collection: Pick<
    Collection<readonly SchemaFieldDefinition[]>,
    "schema" | "types"
  >;
  /** Every column or field the renderer declares, shown or not. */
  readonly fields: readonly DisplayField[];
  /** The renderer declaring them, which its errors name. */
  readonly renderer: "DataTable" | "Cards";
};
