import type { _Item } from "@canonical/ds-types";
import type React from "react";
import type {
  HTMLAttributes,
  KeyboardEvent,
  KeyboardEventHandler,
  RefCallback,
} from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  isMenuSeparator,
  type MenuEntry,
  type MenuItem as MenuTreeItem,
  useContextualMenu,
} from "../../../../hooks/index.js";
import { MenuItem } from "../MenuItem/index.js";
import type { MenuListProps } from "./types.js";

/**
 * The open menu: the same list the closed menu renders, driven by
 * ContextualMenu's keyboard hook. It mounts only while the panel is open, so
 * a closed menu adds no listener.
 *
 * The popover owns the open state and the dismissal, so the hook's own
 * Escape, outside-click and focus return are off, and Escape never reaches
 * the hook: the popover's own close request closes only the panel, and not a
 * dialog or popover around it. The hook's close, on Tab, hides the panel, and
 * the panel returns focus to the trigger. The
 * arrow keys wrap, Home and End reach the ends, and typing moves to the first
 * item whose label starts with what was typed.
 */
export default function MenuList({
  items,
  onSelect,
  hide,
  focusIntent,
  label,
  labelledBy,
  ref: consumerRef,
  onKeyDown,
  onMouseLeave,
  ...props
}: MenuListProps): React.ReactElement {
  const root = useMemo<MenuTreeItem>(
    () => ({ key: "menu", label: "", items }),
    [items],
  );
  const menu = useContextualMenu({
    root,
    isOpen: true,
    wrap: true,
    closeOnEscape: false,
    closeOnOutsideClick: false,
    returnFocus: false,
    onHide: hide,
  });
  // The root built above always carries its items, so the annotated root does.
  const entries = menu.annotatedRoot.items as _Item<MenuEntry>[];
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
    const previousFocus = root.activeElement as HTMLElement;
    let id = 0;
    const settleFocus = (): void => {
      if (!list.contains(root.activeElement)) {
        id = requestAnimationFrame(settleFocus);
      } else if (target) {
        highlightItem(target);
      } else {
        previousFocus.focus();
      }
    };
    id = requestAnimationFrame(settleFocus);
    return () => cancelAnimationFrame(id);
  }, [focusIntent, target, highlightItem, popupRef]);

  // The hook types its props for any element; this menu is a div, as
  // ContextualMenu's is.
  const menuProps = menu.getMenuProps({
    label,
    labelledBy,
    ref: popupRef,
  }) as HTMLAttributes<HTMLDivElement> & {
    ref: RefCallback<HTMLDivElement>;
    onKeyDown: KeyboardEventHandler<HTMLDivElement>;
  };

  // The list is the hook's popup and the consumer's element at once. The
  // hook builds a new ref callback on every render, so the latest is kept
  // and the merged ref stays stable.
  const hookRef = useRef(menuProps.ref);
  hookRef.current = menuProps.ref;
  const attachList = useCallback(
    (node: HTMLDivElement | null) => {
      hookRef.current(node);
      if (typeof consumerRef !== "function") {
        if (consumerRef) consumerRef.current = node;
        return;
      }
      // A React 19 callback ref may return a cleanup, which React then runs
      // instead of calling the ref with null: hand it back, as Modal does.
      const cleanup = consumerRef(node);
      if (typeof cleanup !== "function") return;
      return () => {
        hookRef.current(null);
        cleanup();
      };
    },
    [consumerRef],
  );

  // The consumer's handlers run first, then the hook's, which sets no
  // mouse-leave handler of its own.
  const listProps = {
    ...props,
    ...menuProps,
    ref: attachList,
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      // Left to the popover: closing here, during the keydown, would let the
      // same Escape close the next dialog or popover up as well.
      if (event.key === "Escape") return;
      menuProps.onKeyDown(event);
    },
    onMouseLeave,
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
