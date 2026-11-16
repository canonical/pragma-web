import type React from "react";
import { MenuItem } from "../MenuItem/index.js";
import { MenuList } from "../MenuList/index.js";
import { isMenuSeparator } from "../utils/index.js";
import type { DropdownMenuEntry, MenuProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds dropdown-button-menu";

/**
 * Finds the separators that would dangle while scripting is off, when the
 * action items around them are hidden.
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
    const before = groups.at(index) as { hasLink: boolean }; // index < length
    if (!(before.hasLink && after.hasLink)) keys.add(after.separator);
  });
  return keys;
}

/**
 * A DropdownButton's menu of actions, links and separators, following the
 * menu button pattern once open.
 * An item with a `url` is a link that works with no script; an item without
 * one is hidden until scripting is on, and a menu with no links hides its
 * trigger too.
 */
export default function Menu({
  items,
  onSelect,
  label,
  labelledBy,
  panel,
}: MenuProps): React.ReactElement {
  const hasLink = items.some(
    (entry) => !isMenuSeparator(entry) && entry.url !== undefined,
  );

  // The keyboard hook mounts only while the menu is open, which only a
  // hydrated menu records, so a closed menu, and a menu before hydration, is
  // a static list with no listener.
  if (panel.isOpen) {
    return (
      <MenuList
        items={items}
        onSelect={onSelect}
        hide={panel.hide}
        focusIntent={panel.focusIntent}
        // The ids win over the string, as aria-labelledby wins over
        // aria-label, and the trigger names the menu when neither is given.
        label={labelledBy === undefined ? label : undefined}
        labelledBy={
          labelledBy ?? (label === undefined ? panel.triggerId : undefined)
        }
      />
    );
  }

  const scriptOnlySeparators = findScriptOnlySeparators(items);

  return (
    <div
      className={componentCssClassName}
      data-requires-script={hasLink ? undefined : ""}
    >
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
