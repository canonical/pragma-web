import type { MenuEntry } from "@canonical/react-ds-global";
import type {
  ItemProps,
  MenuProps,
  UseNavigationTreeResult,
} from "@canonical/react-hooks";
import type { Ref, RefObject } from "react";

/** A menu entry as the navigation tree annotates it. */
export type AnnotatedMenuEntry = Parameters<
  UseNavigationTreeResult<MenuEntry>["highlightItem"]
>[0];

/** Result of {@link useIsMounted}: false until the component has mounted. */
export type UseIsMountedResult = boolean;

/** What {@link useMenuNavigation} needs: the entries and how to close. */
export type UseMenuNavigationProps = {
  /** The menu's items and separators, in order. */
  items: MenuEntry[];
  /** Whether the arrow keys wrap at either end. */
  wrap?: boolean | undefined;
  /** Closes the menu, on Tab or Escape. */
  onHide: () => void;
};

/** How the menu names itself, and the list's ref. */
export type MenuNavigationOptions = {
  /** The menu's accessible name. */
  label?: string;
  /** The id of the element that names the menu. */
  labelledBy?: string;
  /** The list element's ref, merged with the tree's. */
  ref: Ref<HTMLElement>;
};

/** The annotated tree, the list's ref and the prop getters. */
export type UseMenuNavigationResult = {
  /** The root, with every entry annotated for navigation. */
  annotatedRoot: UseNavigationTreeResult<MenuEntry>["annotatedRoot"];
  /** The list element, once mounted. */
  popupRef: RefObject<HTMLElement | null>;
  /** Moves the roving highlight, and with it focus, to an item. */
  highlightItem: (item: AnnotatedMenuEntry) => void;
  /** The list's role, name, roving ref and keys. */
  getMenuProps: (options: MenuNavigationOptions) => MenuProps;
  /** One item's role, roving tab stop and handlers. */
  getItemProps: (item: AnnotatedMenuEntry) => ItemProps;
};
