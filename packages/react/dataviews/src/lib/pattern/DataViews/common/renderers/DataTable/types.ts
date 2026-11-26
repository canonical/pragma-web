import type {
  DataViewsMessages,
  DataViewsProvider,
  DisplayStatus,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type {
  ComponentProps,
  JSXElementConstructor,
  ReactElement,
  ReactNode,
} from "react";
import type { AnnouncerTopic } from "../../../../../common/index.js";
import type { DataTableVirtualization } from "../../../../../virtualization/types.js";
import type { ConnectedColumns } from "../../../types.js";
import type { DataTableColumn } from "./common/index.js";

type OwnProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object,
> = {
  /** The provider owning this collection's query, result and selection. */
  readonly provider: DataViewsProvider<TFields, TRow>;
  /**
   * The columns, in declared order; the presentation decides which show and
   * where.
   */
  readonly columns: readonly DataTableColumn<NoInfer<TRow>>[];
  /** The table's accessible name. */
  readonly label: string;
  /** Render a leading selection column backed by the provider's selection. */
  readonly selectable?: boolean;
  /** Names a record for its selection checkbox; defaults to its id. Read by identity. */
  readonly getRowLabel?: (row: TRow, rowId: string) => string;
  /** Replaces a status's message text. */
  readonly renderStatus?: (status: DisplayStatus) => ReactNode;
  /** Mounts only the rows near the viewport, from `virtualizeRows`. */
  readonly virtualization?: DataTableVirtualization;
  /**
   * `<DataTable.SettingsMenu />`, the table's column settings, or another
   * element drawn in the settings cell as given. Requires `id`.
   */
  readonly settings?: ReactElement | undefined;
  /**
   * The table's id: its settings are kept under `table.<id>.*`, the id
   * URI-encoded (`a.b` gives `table.a%2Eb.order`, `order` gives
   * `table.%6Frder.order`). Required with `settings`; an empty id counts
   * as none.
   */
  readonly id?: string | undefined;
  /** Beneath the rows, inside the table's border; sticky, its content flush. */
  readonly footer?: ReactNode;
};

/**
 * Props of the table's body within its UI scope: the table's own and a
 * native table's, with the words and the announcer it speaks through
 * supplied rather than resolved. Never exported from the package.
 */
export type ScopedDataTableProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = OwnProps<TFields, TRow> &
  Omit<
    ComponentProps<"table">,
    | keyof OwnProps<TFields, TRow>
    | "children"
    | "role"
    | "aria-label"
    | "aria-labelledby"
    | "aria-busy"
    | "aria-rowcount"
  > & {
    /** Every message the table renders and announces, resolved. */
    readonly messages: DataViewsMessages;
    /** Say an outcome through the announcer of the table's UI scope. */
    readonly announce: (message: ReactNode, topic?: AnnouncerTopic) => void;
    /** `DataTable.SettingsMenu`, drawn as the menu when given as `settings`. */
    readonly settingsMenu: JSXElementConstructor<never>;
    /** A standalone table's own live region. */
    readonly announcer?: ReactNode;
  };

/**
 * DataTable props: a native table's, less `children` and the ARIA naming
 * and state the table sets. `className`, `style` and `ref` merge with the
 * table's own.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type DataTableProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = Omit<
  ScopedDataTableProps<TFields, TRow>,
  "messages" | "announce" | "settingsMenu" | "announcer"
> & {
  /** The words the table renders and announces, over the English record. */
  readonly messages?: Partial<DataViewsMessages>;
};

/** The brand of a column list `createColumns` returned; never exported. */
declare const declaredOver: unique symbol;

/**
 * A column list `createColumns` returned over records `TRow`. The brand's
 * key is type-only and not exported, so no other list carries it.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type DeclaredColumns<TRow extends object> =
  readonly DataTableColumn<TRow>[] & { readonly [declaredOver]: TRow };

/**
 * Props of the connected table: the table's own, less what the enclosing
 * root supplies — the provider, and the words its parts speak. Columns from
 * `createColumns` type `TRow`; plain columns read `RowRecord`.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type DataViewsDataTableProps<TRow extends object = RowRecord> = Omit<
  DataTableProps<readonly SchemaFieldDefinition[], NoInfer<TRow>>,
  "provider" | "messages" | "columns"
> & {
  /** The columns, in declared order. */
  readonly columns: ConnectedColumns<TRow, DataTableColumn<NoInfer<TRow>>>;
};
