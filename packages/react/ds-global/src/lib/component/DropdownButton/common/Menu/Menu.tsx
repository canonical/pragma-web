import type React from "react";
import { useEffect } from "react";
import { isMenuSeparator, useIsMounted } from "../../../../hooks/index.js";
import { MenuItem } from "../MenuItem/index.js";
import { MenuList } from "../MenuList/index.js";
import { usePanelContext } from "../Panel/hooks/index.js";
import type { DropdownMenuEntry, DropdownMenuProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds dropdown-button-menu";

/**
 * Finds the separators that only make sense once scripts run: those with no
 * link between them and the previous separator or the start, or between them
 * and the next separator or the end. With scripting off the action items are
 * hidden, so such a separator would dangle or double up.
 *
 * @param items The menu's entries, in order.
 * @returns The keys of the separators that need a script.
 */
function findScriptOnlySeparators(items: DropdownMenuEntry[]): Set<string> {
  // Each separator opens a group; the first group has none.
  const groups = [{ separator: "", hasLink: false }];
  for (const entry of items) {
    const current = groups.at(-1) as { hasLink: boolean }; // never empty
    if (isMenuSeparator(entry)) {
      groups.push({ separator: entry.key, hasLink: false });
    } else if (entry.url !== undefined) {
      current.hasLink = true;
    }
  }
  const keys = new Set<string>();
  groups.slice(1).forEach((after, index) => {
    // `index` is the group before `after`, since the slice drops the first.
    const before = groups.at(index) as { hasLink: boolean };
    if (!(before.hasLink && after.hasLink)) keys.add(after.separator);
  });
  return keys;
}

/**
 * A menu inside a DropdownPanel: a flat list of actions and links, with
 * separators and no submenus. Once hydrated, it follows the menu button
 * pattern: the arrow keys move between items, Home and End reach the ends,
 * typing moves to the first item whose label starts with what was typed,
 * Enter or Space chooses an item, and Escape or Tab closes the menu with
 * focus back on the trigger. Choosing an item calls `onSelect(item, event)`,
 * then closes the panel.
 *
 * An item with a `url` is a real link, so it works with no script. Its
 * `onSelect` runs first, and `event.preventDefault()` there leaves the
 * navigation to a client router. An item with no `url` can act only once
 * scripts run, so it is hidden while scripting is off. A menu with no links
 * then hides its trigger too.
 *
 * Items take ContextualMenu's entry shape, without submenus: `key` or `url`,
 * `label`, `disabled`, `icon`, `slot`, `className`, and a custom `Component`,
 * plus `{ type: "separator", key }` entries.
 *
 * `import { DropdownPanel } from "@canonical/react-ds-global";`
 *
 * @implements ds:global.subcomponent.dropdown_button-menu
 */
export default function Menu({
  items,
  onSelect,
  className,
  ...props
}: DropdownMenuProps): React.ReactElement {
  const panel = usePanelContext();
  const isMounted = useIsMounted();
  const registerMenu = panel?.registerMenu;

  // The panel's trigger then advertises a menu rather than a dialog.
  useEffect(() => registerMenu?.(), [registerMenu]);

  const hasLink = items.some(
    (entry) => !isMenuSeparator(entry) && entry.url !== undefined,
  );
  const rootProps = {
    ...props,
    className: [componentCssClassName, className].filter(Boolean).join(" "),
    "data-requires-script": hasLink ? undefined : "",
  };

  // The keyboard hook mounts only while the panel is open, so a closed menu,
  // and a menu before hydration, is a static list with no listener.
  if (isMounted && panel?.isOpen) {
    return (
      <MenuList
        {...rootProps}
        items={items}
        onSelect={onSelect}
        hide={panel.hide}
        focusIntent={panel.focusIntent}
        label={panel.label}
        labelledBy={panel.labelledBy}
      />
    );
  }

  const scriptOnlySeparators = findScriptOnlySeparators(items);

  return (
    <div {...rootProps}>
      {items.map((entry) =>
        isMenuSeparator(entry) ? (
          <hr
            key={entry.key}
            className="separator"
            data-requires-script={
              scriptOnlySeparators.has(entry.key) ? "" : undefined
            }
          />
        ) : (
          <MenuItem key={entry.key ?? entry.url} item={entry} />
        ),
      )}
    </div>
  );
}

Menu.displayName = "DropdownPanel.Menu";
