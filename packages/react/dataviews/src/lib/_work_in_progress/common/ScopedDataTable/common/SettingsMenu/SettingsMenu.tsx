import type { DataViewsMessages } from "@canonical/dataviews-core";
import {
  memo,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";
import type {
  DropdownMenuEntry,
  DropdownMenuItem,
} from "../../../../../common/DropdownButtonStandIn/index.js";
import { MessagesContext } from "../../../../../common/index.js";
import { composeMessage } from "../../../../../utils/index.js";
import { MenuButton } from "../MenuButton/index.js";
import type { ColumnChange, ColumnSetting } from "../types.js";
import { spellDestinationKey } from "../utils/index.js";
import { ItemLabel } from "./common/ItemLabel/index.js";
import LabelsContext from "./LabelsContext.js";
import type { SettingsDestinations, SettingsMenuProps } from "./types.js";

const componentCssClassName = "ds data-table-settings-menu";

/** The message naming each change to a column. */
const CHANGE_MESSAGES = {
  hide: "hideNamedColumn",
  show: "showNamedColumn",
  "move-left": "moveNamedColumnLeft",
  "move-right": "moveNamedColumnRight",
} as const satisfies Readonly<Record<ColumnChange, keyof DataViewsMessages>>;

/** The menu's items, what choosing each does and what each says, by key. */
type ListedItems = {
  readonly items: DropdownMenuEntry[];
  readonly actions: ReadonlyMap<string, () => void>;
  readonly labels: ReadonlyMap<string, ReactNode>;
};

/** What one change to one column is called, with the column's own heading. */
const describeChange = (
  setting: ColumnSetting,
  change: ColumnChange,
  messages: DataViewsMessages,
): ReactNode =>
  composeMessage((place) =>
    messages[CHANGE_MESSAGES[change]](place(setting.column.header)),
  );

/** What a column that cannot be hidden says in place of its toggle. */
const describeAlwaysShown = (
  setting: ColumnSetting,
  messages: DataViewsMessages,
): ReactNode =>
  composeMessage((place) =>
    messages.columnAlwaysShown(place(setting.column.header)),
  );

/** The changes a column is listed with, in the order they are listed. */
const listChanges = (setting: ColumnSetting): readonly ColumnChange[] => [
  setting.hidden ? "show" : "hide",
  "move-left",
  "move-right",
];

/**
 * The menu's items, with what choosing and showing each one does, by its
 * key; each carries its link where a destination is given.
 */
const listItems = (
  {
    settings,
    resettable,
    onChange,
    onReset,
  }: Pick<
    SettingsMenuProps,
    "settings" | "resettable" | "onChange" | "onReset"
  >,
  messages: DataViewsMessages,
  destinations: SettingsDestinations | null,
): ListedItems => {
  const actions = new Map<string, () => void>([["reset", onReset]]);
  const labels = new Map<string, ReactNode>();
  /** An item rendered by the shared label, its content kept by key. */
  const buildItem = (
    key: string,
    content: ReactNode,
    disabled: boolean,
    url: string | undefined,
  ): DropdownMenuItem => {
    labels.set(key, content);
    const item = { key, disabled, displayItemsType: "custom" as const };
    return url === undefined
      ? { ...item, Component: ItemLabel }
      : { ...item, url, Component: ItemLabel };
  };
  const items = settings.flatMap((setting): DropdownMenuEntry[] => {
    const { id, hideable } = setting.column;
    const entries = listChanges(setting).map((change) => {
      const key = spellDestinationKey(id, change);
      const url = destinations?.changes.get(key);
      actions.set(key, () => {
        onChange(id, change);
      });
      // A column that cannot be hidden says so where its toggle would be,
      // and choosing it says so again, so a reader who cannot see a greyed
      // item still hears why.
      return hideable === false && change === "hide"
        ? buildItem(key, describeAlwaysShown(setting, messages), false, url)
        : buildItem(
            key,
            describeChange(setting, change, messages),
            !setting.offers[change],
            url,
          );
    });
    return [...entries, { type: "separator", key: `separator:${id}` }];
  });
  items.push(
    buildItem(
      "reset",
      messages.resetTableSettings,
      !resettable,
      destinations?.reset,
    ),
  );
  return { items, actions, labels };
};

/**
 * Almost all configurable aspects of the table are available through the
 * table settings menu. This menu provides a centralized interface accessed
 * through a settings wheel (gear) icon button in the table header for
 * column reordering, column pinning, column visibility, and resetting user
 * customizations.
 *
 * This implementation covers each column's visibility and place and the
 * reset, as links before scripts run where the provider has a location.
 *
 * @implements ds:apps.subcomponent.data_table-settings_menu
 */
const SettingsMenu = ({
  settings,
  resettable,
  hydrated,
  onChange,
  onReset,
  listDestinations,
}: SettingsMenuProps): ReactElement | null => {
  const messages = useContext(MessagesContext);
  // Read only before scripts run: after, every item acts in place.
  const destinations = hydrated ? null : listDestinations();
  const { items, actions, labels } = useMemo(
    () =>
      listItems(
        { settings, resettable, onChange, onReset },
        messages,
        destinations,
      ),
    [settings, resettable, onChange, onReset, messages, destinations],
  );
  const choose = useCallback(
    (item: DropdownMenuItem) => {
      // Every item listed here has a key; separators are not chosen.
      actions.get(String(item.key))?.();
    },
    [actions],
  );
  const menuProps = useMemo(
    () => ({ items, onSelect: choose }),
    [items, choose],
  );
  // No location before scripts run: no link leads anywhere, so nothing is
  // offered.
  if (!hydrated && destinations === null) {
    return null;
  }
  return (
    <LabelsContext value={labels}>
      <MenuButton
        icon="settings"
        className={componentCssClassName}
        aria-label={messages.tableSettings}
        menuProps={menuProps}
      />
    </LabelsContext>
  );
};

export default memo(SettingsMenu);
