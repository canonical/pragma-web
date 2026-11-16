import type { MenuEntry, MenuItem } from "@canonical/react-ds-global";
import {
  getMenuProps as getMenuAriaProps,
  getMenuItemProps,
  useNavigationTree,
} from "@canonical/react-hooks";
import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { isMenuSeparator } from "../utils/index.js";
import type {
  AnnotatedMenuEntry,
  MenuNavigationOptions,
  UseMenuNavigationProps,
  UseMenuNavigationResult,
} from "./types.js";

/** An open menu's enabled items, the first of which takes focus. */
const ENABLED_ITEM = '[role="menuitem"]:not([aria-disabled="true"])';

/**
 * Drives an open menu's keyboard: roving focus, arrows, Home, End and
 * type-ahead from the navigation tree, with Tab and Escape closing it.
 *
 * Separators enter the tree as presentational nodes, which it skips.
 *
 * @param items The menu's items and separators, in order.
 * @param wrap Whether the arrow keys wrap at either end.
 * @param onHide Closes the menu.
 * @returns The annotated tree, the list's ref and the prop getters.
 * @note Impure: moves focus into the menu, and along with its highlight.
 */
export default function useMenuNavigation({
  items,
  wrap = false,
  onHide,
}: UseMenuNavigationProps): UseMenuNavigationResult {
  const popupRef = useRef<HTMLElement>(null);
  const root = useMemo<MenuItem>(
    () => ({
      key: "menu",
      label: "",
      items: items.map((entry) =>
        isMenuSeparator(entry) ? { ...entry, presentational: true } : entry,
      ),
    }),
    [items],
  );
  const nav = useNavigationTree<MenuEntry>({ root, focus: "roving", wrap });
  const { openMenu } = nav;

  // Open from the start: the menu mounts only while its panel is open.
  useEffect(() => {
    openMenu();
  }, [openMenu]);

  // The first enabled item takes focus once the roving tab stop is applied,
  // two frames on; with none, the list does.
  useEffect(() => {
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => {
        const list = popupRef.current;
        (list?.querySelector<HTMLElement>(ENABLED_ITEM) ?? list)?.focus();
      });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Focus follows the highlight while it is inside the menu, so an item
  // past the fold scrolls into view.
  const highlightedTail = nav.highlightedItems.at(-1);
  useEffect(() => {
    const list = popupRef.current;
    if (!highlightedTail || !list) return;
    const tree = list.getRootNode() as Document | ShadowRoot;
    if (!list.contains(tree.activeElement)) return;
    const id = requestAnimationFrame(() => {
      const item = list.querySelector<HTMLElement>(
        '[role="menuitem"][tabindex="0"]',
      );
      if (item && item !== tree.activeElement) {
        item.focus();
        item.scrollIntoView({ block: "nearest" });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [highlightedTail]);

  const getMenuProps = useCallback(
    ({ ref, ...name }: MenuNavigationOptions) => {
      // The panel owns closing: a pointer leaving the list keeps its place,
      // so the tree's own mouse-leave close is dropped.
      const { onMouseLeave, ...base } = nav.getMenuProps({ ref });
      return {
        ...base,
        ...getMenuAriaProps(nav, name),
        onKeyDown: (event: KeyboardEvent) => {
          event.stopPropagation();
          if (event.key === "Escape" || event.key === "Tab") {
            if (event.key === "Tab") event.preventDefault();
            onHide();
            return;
          }
          base.onKeyDown?.(event);
        },
      };
    },
    [nav, onHide],
  );

  const getItemProps = useCallback(
    (item: AnnotatedMenuEntry) => ({
      ...nav.getItemProps(item),
      ...getMenuItemProps(nav, item),
    }),
    [nav],
  );

  return {
    annotatedRoot: nav.annotatedRoot,
    popupRef,
    highlightItem: nav.highlightItem,
    getMenuProps,
    getItemProps,
  };
}
