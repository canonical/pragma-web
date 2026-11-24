import { assertInvariant } from "@canonical/dataviews-core/bindings";
import type React from "react";
import type {
  HTMLAttributes,
  KeyboardEvent,
  KeyboardEventHandler,
  Ref,
} from "react";
import { useEffect } from "react";
import { useMenuNavigation } from "../hooks/index.js";
import { MenuItem } from "../MenuItem/index.js";
import { isMenuSeparator } from "../utils/index.js";
import type { MenuListProps } from "./types.js";

/**
 * The open menu, driven by the menu keyboard hook, mounted only while the
 * menu is open.
 * The popover owns opening and dismissal, so the hook's Escape, outside click
 * and focus return are off.
 */
export default function MenuList({
  items,
  onSelect,
  hide,
  focusIntent,
  label,
  labelledBy,
}: MenuListProps): React.ReactElement {
  const menu = useMenuNavigation({ items, wrap: true, onHide: hide });
  const entries = assertInvariant(
    menu.annotatedRoot.items,
    "the hook's root carries the items",
  );
  const menuItems = entries.flatMap((entry) =>
    isMenuSeparator(entry) ? [] : [entry],
  );
  const { highlightItem, popupRef } = menu;
  // Where focus should land once the hook has moved it into the menu: the
  // last enabled item after an ArrowUp, or the item that had focus before
  // hydration.
  const target =
    focusIntent === "last"
      ? menuItems.filter((item) => !item.disabled).at(-1)
      : typeof focusIntent === "number"
        ? menuItems.at(focusIntent)
        : undefined;
  // The hook moves focus to the first enabled item a few frames after it
  // mounts. Once focus is inside, highlighting the target makes the hook move
  // the roving focus there; with no target and an intent of "none", focus
  // goes back where it was.
  // @note Impure: schedules a focus move.
  useEffect(() => {
    const list = popupRef.current;
    if (!list || (focusIntent !== "none" && !target)) return;
    // The list's own tree: a document, or a shadow root, where the document
    // only sees the host. Focus is read before the hook moves it, for a menu
    // opened before hydration with focus outside it.
    const root = list.getRootNode() as Document | ShadowRoot;
    const previousFocus = root.activeElement as HTMLElement | null;
    let id = 0;
    const settleFocus = (): void => {
      if (!list.contains(root.activeElement)) {
        id = requestAnimationFrame(settleFocus);
      } else if (target) {
        highlightItem(target);
      } else {
        previousFocus?.focus();
      }
    };
    id = requestAnimationFrame(settleFocus);
    return () => cancelAnimationFrame(id);
  }, [focusIntent, target, highlightItem, popupRef]);

  // The hook types its props for any element; this menu is a div, as
  // ContextualMenu's is.
  // Only the names given, as the hook's options take no undefined.
  const { onKeyDown, ...menuProps } = menu.getMenuProps({
    ...(label === undefined ? {} : { label }),
    ...(labelledBy === undefined ? {} : { labelledBy }),
    ref: popupRef,
  }) as HTMLAttributes<HTMLDivElement> & {
    ref: Ref<HTMLDivElement>;
    onKeyDown: KeyboardEventHandler<HTMLDivElement>;
  };

  const listProps = {
    ...menuProps,
    className: "ds dropdown-button-menu",
    // Escape is left to the popover: closing here, during the keydown, would
    // let the same Escape close the next dialog or popover up as well.
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Escape") onKeyDown(event);
    },
  };

  return (
    <div {...listProps}>
      {entries.map((entry) =>
        isMenuSeparator(entry) ? (
          <hr key={entry.key} className="separator" />
        ) : (
          <MenuItem
            key={entry.key ?? entry.url}
            item={entry}
            itemProps={{
              ...menu.getItemProps(entry),
              // Focus that lands on an item by any route, such as an arrow
              // key on the trigger, moves the roving highlight with it.
              onFocus: () => highlightItem(entry),
            }}
            onSelect={(event) => {
              onSelect?.(entry, event);
              hide();
            }}
          />
        ),
      )}
    </div>
  );
}
