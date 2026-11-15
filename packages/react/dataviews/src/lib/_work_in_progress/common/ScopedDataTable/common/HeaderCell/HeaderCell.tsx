import type { SortDirection } from "@canonical/dataviews-core";
import { assertInvariant } from "@canonical/dataviews-core/bindings";
import { Icon, type IconProps } from "@canonical/react-ds-global";
import {
  type FocusEvent,
  type KeyboardEvent,
  type ReactElement,
  useContext,
  useEffect,
  useRef,
} from "react";
import { MessagesContext } from "../../../../../common/index.js";
import { useHydrationFocusHandoff } from "../../../../../hooks/index.js";
import { HeaderMenu } from "../HeaderMenu/index.js";
import { ResizeHandle } from "../ResizeHandle/index.js";
import isFocusWithinOwnColumn from "./isFocusWithinOwnColumn.js";
import type { HeaderCellProps } from "./types.js";

const componentCssClassName = "ds data-table-header-cell";

/** The ordering's icon. A column the ordering does not name shows none. */
const sortIcon = {
  asc: "chevron-up",
  desc: "chevron-down",
} as const satisfies Readonly<Record<SortDirection, IconProps["icon"]>>;

/** The value `aria-sort` takes for each direction. */
const ariaSort = {
  asc: "ascending",
  desc: "descending",
} as const satisfies Readonly<Record<SortDirection, string>>;

/** Whether a popover can be shown and anchored below its cell. */
const canAnchorPopover = (node: HTMLElement): boolean =>
  typeof node.showPopover === "function" &&
  typeof globalThis.CSS?.supports === "function" &&
  CSS.supports("position-area", "block-end center");

/** Whether a key press activates a button: Enter, or Space. */
const isActivationKey = (event: KeyboardEvent<HTMLButtonElement>): boolean =>
  event.key === "Enter" || event.key === " ";

/**
 * The header cell is the interactive column header element within a data
 * table. It handles sorting, resizing, reordering, and pinning for its
 * column. It is a sub-component and cannot function outside of a data
 * table.
 *
 * The header cell is distinct from the body cell. While the body cell
 * displays data values and provides row-level interactions such as inline
 * editing and row actions, the header cell is responsible for column-level
 * controls that affect how the entire column behaves.
 *
 * Covers sorting, resizing, hiding and moving; no drag reordering or pinning.
 *
 * @implements ds:apps.subcomponent.data_table-header_cell
 */
export default function HeaderCell({
  column,
  sortable,
  precedence,
  primary,
  destination,
  hydrated,
  reason,
  onSort,
  removable,
  onPlace,
  onRemoveFromSort,
  offers,
  onChangeColumn,
  onClearRefusal,
  interaction,
  resizable,
  bounds,
  width,
  labelId,
  announce,
  className,
  ...rest
}: HeaderCellProps): ReactElement {
  const messages = useContext(MessagesContext);
  // Whether Shift was held when a key began activating the button: a click
  // a key produces carries `detail` 0, and not every browser copies the
  // modifier onto it.
  const shiftedKey = useRef(false);
  // The link a server rendered and the button replacing it: the button takes
  // the link's focus, or the reader who tabbed to the header before
  // hydration is left on nothing.
  const { link, button } = useHydrationFocusHandoff({ hydrated });
  // The reason is a manual popover on the cell while it stands, where
  // anchoring works; elsewhere the stylesheet draws it in the cell.
  const cell = useRef<HTMLTableCellElement>(null);
  const reasonRef = useRef<HTMLSpanElement>(null);
  // The element last shown, so a remounted one starts hidden.
  const shown = useRef<HTMLSpanElement | null>(null);
  // The reason's span is drawn only on a sortable header once scripts run.
  const drawsReason = sortable && hydrated;
  useEffect(() => {
    const node = reasonRef.current;
    if (!drawsReason || node === null || !canAnchorPopover(node)) {
      return;
    }
    const standing = reason !== null && reason !== "";
    if (standing && shown.current !== node) {
      node.showPopover({
        source: assertInvariant(cell.current, "a mounted header cell"),
      });
      shown.current = node;
    } else if (!standing && shown.current === node) {
      node.hidePopover();
      shown.current = null;
    }
  }, [reason, drawsReason]);
  const descriptionId = `${labelId}-sort`;
  const describedBy = precedence === null ? undefined : descriptionId;
  const indicator =
    precedence === null ? null : (
      <>
        <Icon icon={sortIcon[precedence.direction]} />
        {precedence.count > 1 ? (
          <span className="precedence" aria-hidden="true">
            {precedence.position}
          </span>
        ) : null}
      </>
    );
  const label = <span className="label">{column.header}</span>;
  const interactive = sortable && (hydrated || destination !== null);

  return (
    <th
      {...rest}
      ref={cell}
      scope="col"
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      // Named by its label alone: a reader hears a column's name on every
      // cell, and the menu's button, the resize handle and a refusal's
      // message would otherwise be read into it each time.
      aria-labelledby={labelId}
      aria-sort={
        primary && precedence !== null
          ? ariaSort[precedence.direction]
          : undefined
      }
      // A header with no control of its own is described itself.
      aria-describedby={interactive ? undefined : describedBy}
      // A refusal's reason stands while focus is in the header or in this
      // column's own menu, whose surface is portalled outside it, and goes
      // once focus leaves both: a choice from the menu settles it through the
      // ordering instead. Opening the menu mounts it and fires no blur at
      // all, so keeping its surface keeps every open alike. Another
      // column's menu is not this header's, and ends it.
      onBlur={(event: FocusEvent<HTMLTableCellElement>) => {
        // The window losing focus, not the column: the reader comes back to
        // the same control, and the reason with it.
        if (!event.currentTarget.ownerDocument.hasFocus()) {
          return;
        }
        const next = event.relatedTarget;
        if (
          !(
            next instanceof Element &&
            isFocusWithinOwnColumn(event.currentTarget, next)
          )
        ) {
          onClearRefusal();
        }
      }}
    >
      {sortable && hydrated ? (
        <button
          ref={button}
          type="button"
          id={labelId}
          className="sort"
          aria-describedby={describedBy}
          onKeyDown={(event) => {
            if (isActivationKey(event)) {
              shiftedKey.current = event.shiftKey;
            }
          }}
          // Enter clicks on its keydown, so its keyup ends it; Space clicks
          // after its keyup, so its click ends it, or leaving the control.
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              shiftedKey.current = false;
            }
          }}
          onBlur={() => {
            shiftedKey.current = false;
          }}
          onClick={(event) => {
            const additive =
              event.shiftKey || (event.detail === 0 && shiftedKey.current);
            shiftedKey.current = false;
            onSort(column.id, additive);
          }}
        >
          {label}
          {indicator}
        </button>
      ) : sortable && destination !== null ? (
        <a
          ref={link}
          href={destination}
          id={labelId}
          className="sort"
          aria-describedby={describedBy}
        >
          {label}
          {indicator}
        </a>
      ) : (
        <>
          <span id={labelId} className="label">
            {column.header}
          </span>
          {indicator}
        </>
      )}
      {precedence === null ? null : (
        <span id={descriptionId} hidden>
          {messages.sortPrecedence(
            precedence.direction,
            precedence.position,
            precedence.count,
          )}
        </span>
      )}
      {drawsReason ? (
        // Shown below the control while it stands, and no live region: the
        // table's announcer said it when it happened, so it is heard once.
        <span ref={reasonRef} className="sort-reason" popover="manual">
          {reason}
        </span>
      ) : null}
      {/* Offered once scripts run, wherever the menu has something to do. */}
      {hydrated &&
      (sortable ||
        offers.hide ||
        offers["move-left"] ||
        offers["move-right"]) ? (
        <HeaderMenu
          columnId={column.id}
          header={column.header}
          sortable={sortable}
          removable={removable}
          hideable={column.hideable !== false}
          offers={offers}
          onPlace={onPlace}
          onRemoveFromSort={onRemoveFromSort}
          onChangeColumn={onChangeColumn}
        />
      ) : null}
      {/* A focusable handle whose keys resize only once scripts run: none
          before then, so nothing is offered that does not work. */}
      {resizable && !hydrated ? (
        // The handle's place, kept until it arrives, so the label does not
        // shrink at hydration. Without scripting the stylesheet drops it.
        <span className="handle-slot" aria-hidden="true" />
      ) : null}
      {resizable && hydrated ? (
        <ResizeHandle
          interaction={interaction}
          columnId={column.id}
          name={column.header}
          width={width}
          {...bounds}
          labelledBy={labelId}
          announce={announce}
        />
      ) : null}
    </th>
  );
}
