import type { _Item } from "@canonical/ds-types";
import { getItemId } from "@canonical/ds-utils";
import {
  getMenuProps as getMenuAriaProps,
  getMenuItemProps,
  useNavigationTree,
} from "@canonical/react-hooks";
import type {
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
} from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { LIST_CLASS_NAME, MENU_ITEM, TOP_LEVEL_ITEM } from "../../constants.js";
import type { MenuEntry, MenuItem, MenuSeparator } from "../../types.js";
import {
  assertDefined,
  findActiveElement,
  isMenuItemDisabled,
  isMenuSeparator,
} from "../../utils/index.js";
import MenuContext from "../MenuContext.js";
import { SubMenu } from "../SubMenu/index.js";
import type { MenuContextValue, NavigationItem } from "../types.js";
import type { MenuListProps } from "./types.js";
import "./styles.css";

const componentCssClassName = LIST_CLASS_NAME;

/** A separator as the navigation tree holds it: presentational, so skipped. */
type NavigationSeparator = MenuSeparator & { presentational: true };

/**
 * Marks separators presentational, at every level, so the tree skips them,
 * and moves a disabled item's flag where the tree does not read it, so the
 * arrows still reach the item.
 */
const prepareEntry = (entry: MenuEntry): MenuEntry => {
  if (isMenuSeparator(entry)) {
    const separator: NavigationSeparator = { ...entry, presentational: true };
    return separator;
  }
  const { disabled, ...rest } = entry;
  const item: NavigationItem = {
    ...rest,
    ...(disabled ? { unavailable: true } : {}),
    items: rest.items?.map(prepareEntry),
  };
  return item;
};

/**
 * The open menu: a `role="menu"` driven by the navigation tree, with its
 * submenus. It mounts only while the menu is open.
 *
 * @implements ds:global.subcomponent.contextual_menu-list
 */
export default function MenuList({
  items,
  onSelect,
  label,
  labelledBy,
  wrap,
  focusIntent,
  hide,
  hideLeavingFocus,
  className,
  ...props
}: MenuListProps): ReactElement {
  const popupRef = useRef<HTMLElement>(null);
  const root = useMemo(
    () => prepareEntry({ key: "menu", label: "", items }) as MenuItem,
    [items],
  );
  const nav = useNavigationTree<MenuEntry>({ root, focus: "roving", wrap });
  const { openMenu, highlightItem } = nav;
  const entries = assertDefined(
    nav.annotatedRoot.items,
    "the menu's root holds its entries",
  ) as _Item<MenuEntry>[];

  // The tree opens highlighting the first item.
  useEffect(() => {
    openMenu();
  }, [openMenu]);

  // Focus enters the menu on the item the intent names, and the highlight
  // follows it there; with no item, the list takes focus.
  // @note Impure: moves focus.
  useEffect(() => {
    if (focusIntent === "none") return;
    const list = assertDefined(popupRef.current, "the list is mounted");
    const topLevel = list.querySelectorAll<HTMLElement>(TOP_LEVEL_ITEM);
    const target =
      focusIntent === "first"
        ? topLevel.item(0)
        : focusIntent === "last"
          ? topLevel.item(topLevel.length - 1)
          : list.querySelectorAll<HTMLElement>(MENU_ITEM).item(focusIntent);
    (target ?? list).focus();
  }, [focusIntent]);

  const highlightedTail = nav.highlightedItems.at(-1);

  // Focus follows the highlight while it is in the menu, or lost to <body>
  // from a submenu item that unmounted, and scrolls into view, so a key
  // pressed next acts on the highlighted item.
  // @note Impure: moves focus.
  useEffect(() => {
    const list = popupRef.current;
    if (!highlightedTail || !list) return;
    const active = findActiveElement(list);
    const focusLost = document.activeElement === document.body;
    if (!focusLost && !list.contains(active)) return;
    const item = list.querySelector<HTMLElement>(
      '[role="menuitem"][tabindex="0"]',
    );
    if (item && item !== active) {
      item.focus();
      item.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedTail]);

  const getMenuProps = useCallback<MenuContextValue["getMenuProps"]>(
    ({ ref, ...name }) => {
      // The popover owns closing, so the tree's mouse-leave close goes.
      const { onMouseLeave, ...base } = nav.getMenuProps({ ref });
      return {
        ...base,
        ...getMenuAriaProps(nav, name),
        onKeyDown: (event: KeyboardEvent) => {
          // Escape in a submenu closes only that submenu, with focus on its
          // parent; at the top it is the popover's, closing the menu.
          const parent = nav.highlightedItems.at(-2);
          const inSubmenu =
            parent !== undefined && parent !== nav.annotatedRoot;
          if (event.key === "Escape" && !inSubmenu) return;
          // One handler serves every level; a key stops at the first.
          event.stopPropagation();
          if (event.key === "Escape" && inSubmenu) {
            event.preventDefault();
            highlightItem(parent);
            return;
          }
          // A disabled parent keeps its submenu shut.
          const tail = nav.highlightedItems.at(-1);
          if (
            event.key === "ArrowRight" &&
            tail?.items?.length &&
            isMenuItemDisabled(tail)
          ) {
            event.preventDefault();
            return;
          }
          // Tab closes the menu and moves on, as the browser takes it.
          if (event.key === "Tab") {
            hideLeavingFocus();
            return;
          }
          base.onKeyDown?.(event);
        },
      };
    },
    [nav, highlightItem, hideLeavingFocus],
  );

  const contextValue = useMemo<MenuContextValue>(
    () => ({
      getItemProps: (item) => ({
        ...nav.getItemProps(item),
        ...getMenuItemProps(nav, item),
        // Focus moved from outside the tree, from the trigger or a pointer,
        // moves the roving highlight with it.
        onFocus: () => highlightItem(item),
      }),
      getMenuProps,
      getNodeStatus: nav.getNodeStatus,
      highlightItem,
      chooseItem: (item: MenuItem, event: MouseEvent<HTMLElement>) => {
        onSelect?.(item, event);
        hide();
      },
    }),
    [nav, getMenuProps, highlightItem, onSelect, hide],
  );

  const menuProps = getMenuProps({
    label,
    labelledBy,
    ref: popupRef,
  }) as HTMLAttributes<HTMLDivElement>;

  return (
    <MenuContext.Provider value={contextValue}>
      <div
        {...props}
        {...menuProps}
        className={[componentCssClassName, className].filter(Boolean).join(" ")}
      >
        {entries.map((entry) => (
          <SubMenu key={getItemId(entry)} item={entry} />
        ))}
      </div>
    </MenuContext.Provider>
  );
}
