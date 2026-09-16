import type {
  DisplayStatus,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import {
  areDisplayStatusesEqual,
  type ColumnToSize,
  createColumnLayout,
  createGridInteraction,
  isDataViewsProvider,
  listDisplayEntries,
  readSizingBounds,
  resolveDisplayStatus,
} from "@canonical/dataviews-core/bindings";
import {
  type CSSProperties,
  isValidElement,
  type ReactElement,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type EntryRenderer,
  MessagesContext,
  VIRTUALIZED,
  type VirtualizedBodyProps,
} from "../../../../common/index.js";
import {
  useDataViewsValue,
  useFieldScopes,
  useIsHydrated,
  useLongPress,
  useMergedRef,
  useRenderCeiling,
  useRowScopes,
  useStableCallback,
  useStableValue,
} from "../../../../hooks/index.js";
import { describeStatus, readFieldName } from "../../../../utils/index.js";
import {
  useColumnArrangement,
  useColumnManagement,
  useHeaderSort,
  useTableGeometry,
} from "../../hooks/index.js";
import type {
  DataTableVirtualization,
  ScopedDataTableProps,
} from "../../types.js";
import {
  HeaderCell,
  Row,
  SelectAllCell,
  SettingsCell,
  type SettingsMenuProps,
  StatusRow,
  TableBody,
} from "../index.js";
import {
  areBodyColumnsEqual,
  areColumnModelsEqual,
  areColumnsEqual,
  isWithinControl,
  readSizing,
} from "../utils/index.js";
import readRowHeader from "./readRowHeader.js";
import "../../styles.css";

/**
 * The root, the caller's box holding the table, its footer and its
 * announcer. `dense` is the design system's own density class: it sets the
 * channel the stylesheet reads for row height and cell padding, so the table
 * is dense wherever it sits.
 */
const componentCssClassName = "ds data-table dense";

/** The frame observes nothing of its own node; the merge is for the caller's ref. */
const attachNothing = (): undefined => undefined;

/**
 * The id of this table's row an event landed in, or null: a header row, the
 * space between rows, or a row of a table nested in one of this table's
 * cells, which is that table's to answer.
 */
const readRowId = (target: EventTarget, table: Element): string | null => {
  /* v8 ignore next 3 -- unreachable: pointer and click events target elements */
  if (!(target instanceof Element)) {
    return null;
  }
  const row = target.closest("[data-row-id]");
  return row !== null && row.closest("[role='table']") === table
    ? row.getAttribute("data-row-id")
    : null;
};

/** One identity for a source that orders by nothing. */
const NO_SORTABLE_FIELDS: readonly string[] = Object.freeze([]);

/**
 * The body a virtualization descriptor carries, given what a virtualized body
 * renders from: the entries and their renderer, the row model, and the
 * published tracks, which re-wrap cells when they change.
 */
const renderVirtualizedBody = (
  virtualization: DataTableVirtualization,
  props: Omit<VirtualizedBodyProps, "estimatedRowHeight">,
): ReactElement => {
  const { body: Body, estimatedRowHeight } = virtualization[VIRTUALIZED];
  return <Body {...props} estimatedRowHeight={estimatedRowHeight} />;
};

/**
 * The table itself, within the UI scope it speaks through: everything
 * `DataTable` renders, given its words and its announcer rather than
 * resolving them. A standalone `DataTable` hands it its own; the connected
 * `DataViews.DataTable` hands it its root's, so a root holds one announcer
 * however many tables it places. Its private cells and menus read the words
 * from the context it installs over them.
 */
export default function ScopedDataTable<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>({
  provider,
  columns,
  label,
  selectable = false,
  rowLabel,
  renderStatus,
  virtualization,
  settings,
  footer,
  messages,
  announcer,
  className,
  style,
  ref,
  ...rest
}: ScopedDataTableProps<TFields, TRow>): ReactElement {
  const { announce, region } = announcer;
  if (!isDataViewsProvider(provider)) {
    throw new Error(
      "DataTable requires a provider created by createDataViewsProvider",
    );
  }
  // Observed for as long as the table is mounted: a standalone table is a
  // mount that reads the provider, and the ref-count makes a table inside
  // a root that already observes cost nothing.
  useEffect(() => provider.observe(), [provider]);
  // Sorting is offered from the same declaration Filters reads.
  const declared = provider.capabilities;
  const sortableFields =
    declared.sort.terms === 0 ? NO_SORTABLE_FIELDS : declared.sort.fields;
  // A set, because the header asks once per column and the table redraws on
  // every frame of a resize. One identity for "nothing is sortable", so the
  // memo holds there too.
  const orderable = useMemo(() => new Set(sortableFields), [sortableFields]);
  const baseId = useId();
  const hydrated = useIsHydrated();

  // The column heading each row, if one is declared, checked where the table
  // mounts. It reads as never hideable, so the columns every arrangement and
  // menu reads carry that reading rather than each of them learning the rule.
  // The caller's columns, held at one reference while they say the same, so
  // a caller's inline columns re-read and re-arrange nothing.
  const declaredColumns = useStableValue(columns, areColumnsEqual);
  // What each column knows of record types: the types its heading names,
  // and whether it applies to a record of one type. Every declared column is
  // checked where the table mounts, a column hidden by the stored arrangement
  // included.
  const { readScope, decideApplicability } = useFieldScopes({
    collection: provider.collection,
    fields: declaredColumns,
    renderer: "DataTable",
  });
  const declaredHeader = useMemo(
    () => readRowHeader(declaredColumns, readScope, provider.collection.types),
    [declaredColumns, readScope, provider],
  );
  const listed = useMemo(
    () =>
      declaredHeader === null
        ? declaredColumns
        : declaredColumns.map((column) =>
            column.rowHeader === true ? declaredHeader : column,
          ),
    [declaredColumns, declaredHeader],
  );

  // The columns the presentation shows, in its order. Both derivations
  // below are keyed on content, not on array identity: a caller who
  // rebuilds its column array on every render must not re-mint the layout,
  // the interaction or one row scope, nor re-render one cell. The two keys
  // are separate because they answer different questions — a caller's
  // inline `header` node must not cost anyone a new layout.
  const rendered = useColumnArrangement({
    presentation: provider.presentation,
    columns: listed,
  });
  const model = useStableValue(rendered, areColumnModelsEqual);
  // What the body rows are handed: held by what a row reads, the heading
  // left out, so inline headings re-render the header row and no body row.
  const bodyColumns = useStableValue(rendered, areBodyColumnsEqual);

  const fields = useMemo<readonly string[]>(
    () => model.map(readFieldName),
    [model],
  );
  const declaredTracks = useMemo<readonly ColumnToSize[]>(
    () =>
      model.map((column) => ({ id: column.id, sizing: readSizing(column) })),
    [model],
  );
  const columnIds = useMemo(
    () => declaredTracks.map((track) => track.id),
    [declaredTracks],
  );

  // The layout is this table's view over the provider's presentation: its
  // widths are read from there and a resize is written there, so nothing
  // here holds a width of its own.
  const layout = useMemo(
    () =>
      createColumnLayout({
        columns: declaredTracks,
        presentation: provider.presentation,
      }),
    [declaredTracks, provider],
  );
  const interaction = useMemo(() => createGridInteraction(layout), [layout]);
  // Subscribed from an effect, never from the render that built it: React
  // may discard a render — StrictMode double-invokes the body, and a
  // concurrent render can be thrown away — and a subscription taken at
  // construction would outlive the interaction nothing else holds.
  useEffect(() => interaction.observe(), [interaction]);

  const geometry = useTableGeometry(layout, interaction, columnIds);
  const rowScopes = useRowScopes(provider, fields);
  const state = useDataViewsValue(provider.state);
  // The core's answer, held at one reference while it says the same thing,
  // so the entries are listed again only when a row identity or the status
  // changes.
  const status = useStableValue(
    resolveDisplayStatus(state),
    areDisplayStatusesEqual,
  );
  const ids = useDataViewsValue(rowScopes.ids);
  // The core decides what the body shows: the status row first, then the
  // rows where the status keeps them.
  const entries = useMemo(
    () => listDisplayEntries({ rowIds: ids, status }),
    [ids, status],
  );
  // Busy while a request is in flight, and only then: the root says so
  // over retained rows as over none.
  const busy = state.pendingRequestId !== null;
  // A development prompt past the ceiling, never a cap: every row is drawn.
  useRenderCeiling({
    renderer: "DataTable",
    count: ids.length,
    virtualized: virtualization !== undefined,
  });

  // Selection mode, on touch: a long press on a row selects it and enters
  // the mode, where a tap toggles a row; it ends when the last selected row
  // is deselected. Both are announced, since nothing on screen says either.
  const [selecting, setSelecting] = useState(false);
  const enterSelection = useStableCallback((rowId: string): void => {
    provider.selection.add([rowId]);
    if (!selecting) {
      setSelecting(true);
      announce(messages.selectionModeEntered);
    }
  });
  // One gesture for the whole body rather than one per row: the row a press
  // or a tap landed on is found by its id, and only rows of this table carry
  // one. A press or a tap on one of the row's own controls is that
  // control's — held on the checkbox, a press would select the row and the
  // checkbox's own change would deselect it again.
  const gestures = useLongPress({
    claim: (target, container) =>
      isWithinControl(target) ? null : readRowId(target, container),
    onLongPress: enterSelection,
    onTap: (rowId) => {
      if (selecting) {
        provider.selection.toggle(rowId);
      }
    },
  });
  // Subscribed only while in the mode, so a table outside it re-renders for
  // no selection change of its own. The mode ends with the last selected
  // row — as it stands when the subscription is taken, too, since a
  // selection emptied or a provider swapped before then publishes nothing
  // here — and with selection no longer offered.
  useEffect(() => {
    if (!selecting) {
      return undefined;
    }
    const endIfEmpty = (): void => {
      if (provider.selection.state.get().ids.size === 0) {
        setSelecting(false);
        announce(messages.selectionModeEnded);
      }
    };
    if (!selectable) {
      setSelecting(false);
      return undefined;
    }
    endIfEmpty();
    return provider.selection.state.subscribe(endIfEmpty);
  }, [selecting, selectable, provider, announce, messages]);

  // The header row's sort: the ordering in force and what each column shows
  // of it, the column that claims it, refusals, no-JS destinations, and the
  // actions every header shares, each announcing what it did.
  const headerSort = useHeaderSort({
    provider,
    columns: rendered,
    slice: state.slice,
    window: state.window,
    messages,
    announce,
  });

  // The columns' visibility and places, as the settings menu offers them
  // and every change to them is announced. The header row takes the focus a
  // hidden column's own controls leave.
  const headerRow = useRef<HTMLDivElement>(null);
  const {
    settings: columnSettings,
    readOffers,
    resettable,
    changeColumn,
    resetColumns,
    listDestinations,
  } = useColumnManagement({
    provider,
    columns: listed,
    headerRow,
    messages,
    announce,
  });
  // One value while none of it changes, so a frame of a resize re-renders
  // no settings menu.
  const menu = useMemo<SettingsMenuProps>(
    () => ({
      settings: columnSettings,
      resettable,
      hydrated,
      onChange: changeColumn,
      onReset: resetColumns,
      listDestinations,
    }),
    [
      columnSettings,
      resettable,
      hydrated,
      changeColumn,
      resetColumns,
      listDestinations,
    ],
  );

  // The caller's ref reaches the frame behind one identity, as the props
  // promise: a callback ref rebuilt every render costs no re-attach. The
  // frame attaches nothing of its own — the solver measures the table
  // within it, whose width leaves out the scrollbar the frame's would count.
  const attach = useMergedRef(ref, attachNothing);

  // Held behind one identity apiece: the README's own examples pass these
  // as lambdas, and a new function per render would re-render every row
  // and every cell of the body for nothing. Answers null where the caller
  // names no row, so a row is named by its header, or by its identity.
  const nameRecord = useStableCallback(
    (row: TRow, rowId: string): string | null =>
      rowLabel === undefined ? null : rowLabel(row, rowId),
  );
  // The messages' words for a status, unless the caller renders its own.
  const describe = useCallback(
    (shown: DisplayStatus) => describeStatus(shown, messages),
    [messages],
  );
  const statusRenderer = renderStatus ?? describe;
  const showStatus = useStableCallback(statusRenderer);
  // While a status shows, the latest renderer, so a new one is shown at
  // once; otherwise the held one, which re-renders nothing.
  const renderer = status === null ? showStatus : statusRenderer;

  // One renderer for either body, held while what it closes over holds:
  // the bodies key, place and measure rows without knowing them.
  const renderEntry = useCallback<EntryRenderer>(
    (entry, placement) =>
      entry.kind === "status" ? (
        <StatusRow
          ref={placement?.ref}
          position={placement?.position}
          status={entry.status}
          renderStatus={renderer}
        />
      ) : (
        <Row
          ref={placement?.ref}
          position={placement?.position}
          provider={provider}
          channels={rowScopes.readRow(entry.rowId)}
          columns={bodyColumns}
          selectable={selectable}
          nameRecord={nameRecord}
          decideApplicability={decideApplicability}
        />
      ),
    [
      renderer,
      provider,
      rowScopes,
      bodyColumns,
      selectable,
      nameRecord,
      decideApplicability,
    ],
  );

  // A custom property, which `CSSProperties` does not spell. Written on the
  // table, the container the solver measured, from which every row reads it;
  // the caller's style is the frame's.
  const geometryStyle = {
    "--data-table-columns": geometry.template,
  } as CSSProperties;

  return (
    <MessagesContext value={messages}>
      {/* The frame is the caller's box: it takes the caller's props, holds
          the table, the footer beneath it and the announcer, and a height
          capped on it scrolls the table within it. */}
      <div
        {...rest}
        ref={attach}
        className={[componentCssClassName, className].filter(Boolean).join(" ")}
        style={style}
      >
        {/* biome-ignore lint/a11y/useSemanticElements: a <table> resolves each row's widths from its own content, which is exactly what this grid replaces with one shared track list */}
        <div
          ref={geometry.attach}
          className="table"
          style={geometryStyle}
          role="table"
          aria-label={label}
          aria-busy={busy}
          // A custom state with no native or ARIA attribute: an attribute,
          // present while the mode holds.
          data-selection-mode={selecting ? "true" : undefined}
          {...(selectable ? gestures : {})}
          // Every logical row, the header's included, so a row a virtualized
          // table has not mounted is still counted.
          aria-rowcount={
            virtualization === undefined ? undefined : entries.length + 1
          }
        >
          {/* biome-ignore lint/a11y/useSemanticElements: <thead> is only valid inside a <table>, and this grid is deliberately not one */}
          <div role="rowgroup" className="ds data-table-row-group header">
            {/* biome-ignore lint/a11y/useSemanticElements: <tr> is only valid inside a <table>, and this grid is deliberately not one */}
            {/* biome-ignore lint/a11y/useFocusableInteractive: the row is structure, not a widget — the focusable controls live in its cells */}
            <div
              ref={headerRow}
              role="row"
              className="ds data-table-row"
              aria-rowindex={virtualization === undefined ? undefined : 1}
            >
              {selectable ? (
                <SelectAllCell
                  selection={provider.selection}
                  ids={rowScopes.ids}
                  reserve={geometry.reserve}
                />
              ) : null}
              {rendered.map((column, position) => {
                const field = readFieldName(column);
                const sortable =
                  column.sortable === true && orderable.has(field);
                return (
                  <HeaderCell
                    key={column.id}
                    column={column}
                    sortable={sortable}
                    precedence={headerSort.precedences.get(field) ?? null}
                    primary={column.id === headerSort.primaryColumnId}
                    // Spelled only while it is rendered: once scripts take over
                    // the header is a button, and nothing reads a destination.
                    destination={
                      sortable && !hydrated
                        ? headerSort.spellDestination(column.id)
                        : null
                    }
                    hydrated={hydrated}
                    reason={headerSort.readReason(column.id)}
                    onClearRefusal={headerSort.clearRefusal}
                    onSort={headerSort.sortColumn}
                    removable={headerSort.stated.has(field)}
                    onPlace={headerSort.placeColumn}
                    onRemoveFromSort={headerSort.removeFromSort}
                    offers={readOffers(column.id)}
                    onChangeColumn={changeColumn}
                    interaction={interaction}
                    resizable={
                      column.resizable === true &&
                      position < rendered.length - 1
                    }
                    bounds={readSizingBounds(layout.readDeclared(column.id))}
                    // Solved for every rendered column, in the same order.
                    width={geometry.widths[position] as number}
                    labelId={`${baseId}-${column.id}`}
                    scope={readScope(column).scope}
                  />
                );
              })}
              {!isValidElement(settings) ? null : (
                <SettingsCell
                  settings={settings}
                  menu={menu}
                  reserve={geometry.reserve}
                />
              )}
            </div>
          </div>
          {virtualization === undefined ? (
            <TableBody entries={entries} renderEntry={renderEntry} />
          ) : (
            renderVirtualizedBody(virtualization, {
              entries,
              renderEntry,
              rows: provider.rows,
              tracks: geometry.template,
            })
          )}
        </div>
        {/* Beneath the table and outside its role, since a table's children
          are its row groups: the bar here is a landmark, not a row. */}
        {footer === undefined ? null : <div className="footer">{footer}</div>}
        {region}
      </div>
    </MessagesContext>
  );
}
