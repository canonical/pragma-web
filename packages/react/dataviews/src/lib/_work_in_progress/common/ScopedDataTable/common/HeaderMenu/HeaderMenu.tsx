import type { DataViewsMessages } from "@canonical/dataviews-core";
import {
  memo,
  type ReactElement,
  useCallback,
  useContext,
  useId,
  useMemo,
} from "react";
import {
  type DropdownMenuEntry,
  type DropdownMenuItem,
  withDropdownMenu,
} from "../../../../../common/DropdownButtonStandIn/index.js";
import { IconButtonStandIn } from "../../../../../common/IconButtonStandIn/index.js";
import { MessagesContext } from "../../../../../common/index.js";
import { composeMessage } from "../../../../../utils/index.js";
import type { HeaderMenuProps } from "./types.js";

const componentCssClassName = "ds data-table-header-menu";

/** The icon button and the menu it opens. */
const MenuTrigger = withDropdownMenu(IconButtonStandIn);

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
  }: Pick<HeaderMenuProps, "sortable" | "removable" | "hideable" | "offers">,
  messages: DataViewsMessages,
): DropdownMenuEntry[] => {
  const sort: DropdownMenuEntry[] = sortable
    ? [
        { key: "asc", label: messages.sortAscending },
        { key: "desc", label: messages.sortDescending },
        ...(removable
          ? [{ key: "remove", label: messages.removeFromSort }]
          : []),
        { type: "separator", key: "separator" },
      ]
    : [];
  const hide: DropdownMenuEntry[] = hideable
    ? [{ key: "hide", label: messages.hideColumn, disabled: !offers.hide }]
    : [];
  return [
    ...sort,
    ...hide,
    {
      key: "move-left",
      label: messages.moveColumnLeft,
      disabled: !offers["move-left"],
    },
    {
      key: "move-right",
      label: messages.moveColumnRight,
      disabled: !offers["move-right"],
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
  onPlace,
  onRemoveFromSort,
  onChangeColumn,
}: HeaderMenuProps): ReactElement => {
  const messages = useContext(MessagesContext);
  const labelId = useId();
  const items = useMemo(
    () => listItems({ sortable, removable, hideable, offers }, messages),
    [sortable, removable, hideable, offers, messages],
  );
  // One identity while the column holds, so the menu's own context holds.
  const choose = useCallback(
    (item: DropdownMenuItem) => {
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
      ? { label: messages.columnOptions(header) }
      : { labelledBy: labelId };
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
