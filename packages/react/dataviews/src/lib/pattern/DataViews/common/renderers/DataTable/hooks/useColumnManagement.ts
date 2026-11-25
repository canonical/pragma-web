import type {
  JsonValue,
  PresentationPatch,
  ReadonlyChannel,
  RowRecord,
  SchemaFieldDefinition,
  ViewPresentation,
  ViewsState,
} from "@canonical/dataviews-core";
import {
  type ColumnCommandConfig,
  hideColumn,
  moveColumn,
  readProviderHost,
  resetColumnArrangement,
  resolveColumnArrangement,
  showColumn,
  spellColumnArrangement,
} from "@canonical/dataviews-core/bindings";
import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import {
  useDataViewsValue,
  useStableCallback,
  useStableValue,
} from "../../../../../../hooks/index.js";
import { composeMessage } from "../../../../../../utils/index.js";
import type {
  ColumnChange,
  ColumnSetting,
  DataTableColumn,
  SettingsDestinations,
} from "../common/index.js";
import {
  areColumnSettingsEqual,
  areColumnsEqual,
  listColumnSettings,
  spellDestinationKey,
} from "../common/utils/index.js";
import type {
  UseColumnManagementProps,
  UseColumnManagementResult,
} from "./types.js";

/** What each change writes to an arrangement, or null where it changes nothing. */
const CHANGES = {
  hide: hideColumn,
  show: showColumn,
  "move-left": (config) => moveColumn({ ...config, offset: -1 }),
  "move-right": (config) => moveColumn({ ...config, offset: 1 }),
} satisfies Readonly<
  Record<
    ColumnChange,
    (config: ColumnCommandConfig<DataTableColumn>) => PresentationPatch | null
  >
>;

/** Every change, in the order a column lists them. */
const COLUMN_CHANGES = [
  "hide",
  "show",
  "move-left",
  "move-right",
] as const satisfies readonly ColumnChange[];

/** The arrangement a change leaves: its keys over the arrangement's. */
const applyPatch = (
  presentation: ViewPresentation,
  patch: PresentationPatch,
): ViewPresentation =>
  Object.fromEntries(
    Object.entries({ ...presentation, ...patch }).filter(
      (entry): entry is [string, JsonValue] => entry[1] !== undefined,
    ),
  );

/** What a provider keeping no views is read as: nothing listed, ever. */
const NO_VIEWS: ReadonlyChannel<ViewsState | null> = {
  get: () => null,
  subscribe: () => () => {},
};

/** Whether the views are being listed, or failed to be and wait on a refresh. */
const isListingView = (views: ViewsState | null): boolean =>
  views?.listing.status === "pending" || views?.listing.status === "failed";

/** The view shown, by its id, or null. */
const readShownView = (views: ViewsState | null): string | null =>
  views?.current?.id ?? null;

/** The ids an arrangement shows, in its order. */
const listShownIds = (
  columns: readonly DataTableColumn[],
  presentation: ViewPresentation,
  table: string,
): readonly string[] =>
  resolveColumnArrangement(table, columns, presentation)
    .filter(({ hidden }) => !hidden)
    .map(({ column }) => column.id);

/**
 * The table's column management: each column's changes, the commands
 * that hide, show, move and reset columns, and their no-script links.
 */
export default function useColumnManagement<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>(
  ...[
    provider,
    { table, presentation, shared },
    columns,
    headerRow,
    messages,
    announce,
  ]: UseColumnManagementProps<TFields, TRow>
): UseColumnManagementResult {
  const declared = useStableValue(columns, areColumnsEqual);
  // The arrangement alone: a change to the reason re-renders no table.
  const arranged = useDataViewsValue(presentation.state, {
    select: (shown) => shown.presentation,
  });
  // The list last handed out, whose offers objects a new list keeps where a
  // column's changes hold. Written during render: the latest list is what
  // every later render compares with, so a discarded render writing it
  // first is harmless.
  const previous = useRef<readonly ColumnSetting[]>([]);
  const derived = useMemo(
    () => listColumnSettings(declared, arranged, table, previous.current),
    [declared, arranged, table],
  );
  // Held at one reference while they say the same: a resize writes a width,
  // which changes no column's visibility or place.
  const settings = useStableValue(derived, areColumnSettingsEqual);
  previous.current = settings;
  // Each column's offers by its id, so a header reads its own at once on
  // every render of the header row.
  const offersById = useMemo(
    () => new Map(settings.map(({ column, offers }) => [column.id, offers])),
    [settings],
  );
  // The view a link opened, while the views are listed and it is not shown:
  // a change now would land beneath that view's arrangement. Only a table
  // keeping its arrangement in the provider's presentation waits.
  const opened = useDataViewsValue(readProviderHost(provider).view);
  const viewsState = provider.views?.state ?? NO_VIEWS;
  const listing = useDataViewsValue(viewsState, { select: isListingView });
  const shownView = useDataViewsValue(viewsState, { select: readShownView });
  const waiting = shared && listing && opened !== null && shownView !== opened;
  const readOffers = useCallback(
    (columnId: string): ColumnSetting["offers"] => {
      const offers = offersById.get(columnId);
      if (offers === undefined) {
        throw new Error(`no column "${columnId}" is declared`);
      }
      return offers;
    },
    [offersById],
  );
  // The viewer's own changes where a change is written now: what a reset can
  // clear, so an open view's saved arrangement beneath never keeps it on.
  const own = useDataViewsValue(presentation.state, {
    select: (shown) => shown.own,
  });
  const resettable = useMemo(
    () =>
      Object.keys(resetColumnArrangement({ table, presentation: own })).length >
      0,
    [own, table],
  );

  // Where a hidden column stood among the shown ones, until the render that
  // removed it has recovered the focus it may have taken. Run after every
  // render, reading a ref: the render that removed a column is not one the
  // effect could name by what it reads.
  const recoverAt = useRef<number | null>(null);
  useLayoutEffect(() => {
    const at = recoverAt.current;
    const row = headerRow.current;
    if (at === null || row === null) {
      return;
    }
    recoverAt.current = null;
    const active = row.ownerDocument.activeElement;
    // Focus kept somewhere — a menu's button took it back — is left there.
    if (active !== null && active !== row.ownerDocument.body) {
      return;
    }
    // Arrays from the lists, not spreads: a node list is iterable only where
    // the DOM's iterable typings are loaded.
    const cells = Array.from(
      row.querySelectorAll<HTMLElement>(
        ":scope > th:not(.ds.data-table-select-all-cell):not(.ds.data-table-settings-cell)",
      ),
    );
    const nearest = Math.max(0, Math.min(at, cells.length - 1));
    // The heading now standing where the hidden column stood, then those
    // after it, then those before it, nearest first, then the settings: the
    // first holding a control takes the focus.
    const candidates = [
      ...cells.slice(nearest),
      ...cells.slice(0, nearest).reverse(),
      ...Array.from(
        row.querySelectorAll<HTMLElement>(
          ":scope > .ds.data-table-settings-cell",
        ),
      ),
    ];
    for (const cell of candidates) {
      const control = cell.querySelector<HTMLElement>("button, a[href]");
      if (control !== null) {
        control.focus();
        return;
      }
    }
  });

  const changeColumn = useStableCallback(
    (columnId: string, change: ColumnChange) => {
      const column = columns.find((candidate) => candidate.id === columnId);
      if (column === undefined) {
        return;
      }
      const current = presentation.state.get().presentation;
      const patch = CHANGES[change]({
        table,
        columns,
        presentation: current,
        id: columnId,
      });
      if (patch === null) {
        if (change === "hide" && column.hideable === false) {
          // Under no topic: each column is its own subject, so two
          // columns refused in one moment are both read rather than the
          // second standing for the first.
          announce(
            composeMessage((place) =>
              messages.columnAlwaysShown(place(column.header)),
            ),
          );
        }
        return;
      }
      const before = listShownIds(columns, current, table).indexOf(columnId);
      presentation.arrange(patch);
      if (change === "hide") {
        recoverAt.current = before;
        announce(
          composeMessage((place) =>
            messages.columnHidden(place(column.header)),
          ),
        );
        return;
      }
      const shown = listShownIds(
        columns,
        presentation.state.get().presentation,
        table,
      );
      const position = shown.indexOf(columnId) + 1;
      const word =
        change === "show" ? messages.columnShown : messages.columnMoved;
      announce(
        composeMessage((place) =>
          word({ name: place(column.header), position, total: shown.length }),
        ),
      );
    },
  );

  const resetColumns = useStableCallback(() => {
    const patch = resetColumnArrangement({
      table,
      presentation: presentation.state.get().own,
    });
    if (Object.keys(patch).length === 0) {
      return;
    }
    presentation.arrange(patch);
    announce(messages.tableSettingsReset);
  });

  const { spellQuery } = readProviderHost(provider);
  const listDestinations = useStableCallback(
    (): SettingsDestinations | null => {
      // A table without an id keeps its arrangement for the mount: no link
      // carries it.
      if (!shared) {
        return null;
      }
      // The same query from the page it stands on, read once for every
      // link: a change to the columns asks the source for nothing, so the
      // window stays where it is.
      const { slice, window: queryWindow } = provider.state.get();
      const params = spellQuery({ slice, window: queryWindow });
      if (params === null) {
        return null;
      }
      // Spelled from the table's stored lists, so a link keeps the ids of
      // columns it no longer declares, and another table's parameters.
      const spell = (next: ViewPresentation | null): string =>
        `?${spellColumnArrangement({ table, params, columns, presentation: next })}`;
      const current = presentation.state.get().presentation;
      const changes = new Map<string, string>();
      for (const column of columns) {
        for (const change of COLUMN_CHANGES) {
          const patch = CHANGES[change]({
            table,
            columns,
            presentation: current,
            id: column.id,
          });
          if (patch !== null) {
            changes.set(
              spellDestinationKey(column.id, change),
              spell(applyPatch(current, patch)),
            );
          }
        }
      }
      return { changes, reset: spell(null) };
    },
  );

  return {
    settings,
    readOffers,
    resettable,
    reason: waiting ? messages.columnsPending : null,
    changeColumn,
    resetColumns,
    listDestinations,
  };
}
