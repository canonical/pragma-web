import type { DataViewsMessages } from "@canonical/dataviews-core";
import {
  type MenuEntry,
  type MenuItem,
  withContextualMenu,
} from "@canonical/react-ds-global";
import {
  memo,
  type ReactElement,
  useCallback,
  useContext,
  useId,
  useMemo,
} from "react";
import { IconButtonStandIn } from "../../../../../../../common/IconButtonStandIn/index.js";
import { MessagesContext } from "../../../../../../../common/index.js";
import { composeMessage } from "../../../../../../../utils/index.js";
import type { HeaderMenuProps } from "./types.js";

const componentCssClassName = "ds data-table-header-menu";

/** The icon button and the menu it opens. */
const MenuTrigger = withContextualMenu(IconButtonStandIn);

/**
 * The menu's items: the column's sort where it offers one, with remove
 * where it applies, then its visibility and its place, in the table's words.
 */
const listItems = (
  {
    sortable,
    removable,
    hideable,
    offers,
    columnsReason,
  }: Pick<
    HeaderMenuProps,
    "sortable" | "removable" | "hideable" | "offers" | "columnsReason"
  >,
  messages: DataViewsMessages,
): MenuEntry[] => {
  const sort: MenuEntry[] = sortable
    ? [
        { key: "asc", label: messages.sortAscending },
        { key: "desc", label: messages.sortDescending },
        ...(removable
          ? [{ key: "remove", label: messages.removeFromSort }]
          : []),
        { type: "separator", key: "separator" },
      ]
    : [];
  // Waiting, the reason stands first and no column change can be chosen.
  const waiting = columnsReason !== null;
  const reason: MenuEntry[] = waiting
    ? [
        { key: "reason", label: columnsReason, disabled: true },
        { type: "separator", key: "separator:reason" },
      ]
    : [];
  const hide: MenuEntry[] = hideable
    ? [
        {
          key: "hide",
          label: messages.hideColumn,
          disabled: waiting || !offers.hide,
        },
      ]
    : [];
  return [
    ...reason,
    ...sort,
    ...hide,
    {
      key: "move-left",
      label: messages.moveColumnLeft,
      disabled: waiting || !offers["move-left"],
    },
    {
      key: "move-right",
      label: messages.moveColumnRight,
      disabled: waiting || !offers["move-right"],
    },
  ];
};

/**
 * One column's header menu: its sort, visibility and place, from an icon
 * button named for the column.
 *
 * Offered once scripts run; choosing an item closes the menu and returns
 * focus to its button.
 *
 * @implements ds:apps.subcomponent.data_table-header_menu
 */
const HeaderMenu = ({
  columnId,
  header,
  sortable,
  removable,
  hideable,
  offers,
  columnsReason,
  onPlace,
  onRemoveFromSort,
  onChangeColumn,
}: HeaderMenuProps): ReactElement => {
  const messages = useContext(MessagesContext);
  const labelId = useId();
  const items = useMemo(
    () =>
      listItems(
        { sortable, removable, hideable, offers, columnsReason },
        messages,
      ),
    [sortable, removable, hideable, offers, columnsReason, messages],
  );
  // One identity while the column holds, so the menu's own context holds.
  const choose = useCallback(
    (item: MenuItem) => {
      switch (item.key) {
        case "remove":
          onRemoveFromSort(columnId);
          return;
        case "asc":
        case "desc":
          onPlace(columnId, item.key);
          return;
        case "hide":
        case "move-left":
        case "move-right":
          onChangeColumn(columnId, item.key);
          return;
      }
    },
    [columnId, onPlace, onRemoveFromSort, onChangeColumn],
  );
  // A menu's name does not follow the button's reference, so a text heading
  // names the menu itself, and any other is referenced again.
  const name =
    typeof header === "string"
      ? { menuLabel: messages.columnOptions(header) }
      : { menuLabelledBy: labelId };
  return (
    <>
      {/* The column's heading need not be text, so it names the button by
          reference. */}
      <span id={labelId} hidden>
        {composeMessage((place) => messages.columnOptions(place(header)))}
      </span>
      <MenuTrigger
        icon="menu-contextual"
        importance="tertiary"
        className={componentCssClassName}
        aria-labelledby={labelId}
        items={items}
        onSelect={choose}
        {...name}
      />
    </>
  );
};

export default memo(HeaderMenu);
