import type { ReactElement, ToggleEvent } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Item, type MenuFocusIntent, MenuList } from "./common/index.js";
import { LIST_CLASS_NAME, MENU_ITEM, TOP_LEVEL_ITEM } from "./constants.js";
import type { ContextualMenuProps, MenuEntry } from "./types.js";
import {
  assertDefined,
  findActiveElement,
  findTrigger,
  formatIdent,
  isMenuLink,
  isMenuSeparator,
} from "./utils/index.js";
import "./styles.css";

const componentCssClassName = "ds contextual-menu";

/**
 * Finds the separators that only make sense once scripts run: those with no
 * link in the group before or after them. With scripting off the action
 * items are hidden, so such a separator would dangle or double up.
 *
 * @param items The menu's entries, in order.
 * @returns The keys of the separators that need a script.
 */
function findScriptOnlySeparators(items: MenuEntry[]): Set<string> {
  const keys = new Set<string>();
  // The open group, the separator that opened it, and whether the group
  // before it held a link.
  let separator: string | undefined;
  let beforeHasLink = false;
  let hasLink = false;
  // Hides the open separator when a group beside it has no link, and says
  // whether it did.
  const close = (): boolean => {
    if (separator === undefined || (beforeHasLink && hasLink)) return false;
    keys.add(separator);
    return true;
  };
  for (const entry of items) {
    if (isMenuSeparator(entry)) {
      // A hidden separator merges its two groups, so the earlier group's
      // link carries forward.
      const hidden = close();
      separator = entry.key;
      beforeHasLink = hasLink || (hidden && beforeHasLink);
      hasLink = false;
    } else if (isMenuLink(entry)) {
      hasLink = true;
    }
  }
  close();
  return keys;
}

/**
 * A contextual menu provides secondary actions and options that can be
 * attached to various interface controls, including Buttons, command Links,
 * and right-click interactions. It displays relevant actions based on the
 * context of the element or area it's associated with, helping to keep the
 * interface clean while making additional functionality easily accessible
 * when needed.
 *
 * `import { ContextualMenu } from "@canonical/react-ds-global";`
 *
 * @implements ds:global.component.contextual_menu
 */
export default function ContextualMenu({
  id,
  items,
  onSelect,
  label,
  labelledBy,
  wrap = true,
  className,
  style,
  onBeforeToggle,
  onToggle,
  ...props
}: ContextualMenuProps): ReactElement {
  const generatedId = formatIdent(useId());
  const menuId = id ?? generatedId;
  // The effects read the element from state, so they run once it exists.
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [triggerId, setTriggerId] = useState<string>();
  // Where focus goes as the menu opens: the first item, the last after
  // ArrowUp on the trigger, or where it was in a menu opened before
  // hydration.
  const [focusIntent, setFocusIntent] = useState<MenuFocusIntent>("first");
  // Each opening mounts a fresh list, even one that follows a close the
  // menu has not yet heard of.
  const [openings, setOpenings] = useState(0);
  const hadFocusRef = useRef(false);

  // A popover opened before hydration fired its toggle before React
  // listened. Focus is read as the element attaches, since the re-render
  // that follows may replace the focused item.
  // @note Impure: reads the popover's state and focus from the DOM.
  const attachElement = useCallback((node: HTMLDivElement | null) => {
    setElement(node);
    if (!node?.matches(":popover-open")) return;
    const entries = [...node.querySelectorAll(MENU_ITEM)];
    const active = findActiveElement(node);
    const index = entries.findIndex((entry) => entry === active);
    setFocusIntent(index >= 0 ? index : "none");
  }, []);

  // @note Impure: reads the popover's state and its trigger from the DOM.
  const readState = useCallback((popover: HTMLDivElement) => {
    const open = popover.matches(":popover-open");
    setOpen(open);
    if (open) setTriggerId(findTrigger(popover)?.id);
  }, []);

  useEffect(() => {
    if (element) readState(element);
  }, [element, readState]);

  // A page restored from the back-forward cache comes back as it was left,
  // with no toggle event: an open menu re-reads its state then.
  // @note Impure: listens to the window's pageshow event.
  useEffect(() => {
    if (!element || !isOpen) return;
    const handlePageShow = (): void => readState(element);
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [element, isOpen, readState]);

  // ArrowDown and ArrowUp on the trigger open the menu on its first or last
  // item, or move focus there in an open one. Listening on the root runs
  // after React, so a trigger's own preventDefault skips them.
  // @note Impure: listens to keydown, opens the popover, moves focus.
  useEffect(() => {
    if (!element) return;
    const root = element.getRootNode();
    if (!(root instanceof Document || root instanceof ShadowRoot)) return;
    const handleKeyDown = (event: Event): void => {
      const { key, target, defaultPrevented } = event as KeyboardEvent;
      if (defaultPrevented || (key !== "ArrowDown" && key !== "ArrowUp")) {
        return;
      }
      if (target !== findTrigger(element)) return;
      event.preventDefault();
      const last = key === "ArrowUp";
      if (!element.matches(":popover-open")) {
        setFocusIntent(last ? "last" : "first");
        element.showPopover();
        return;
      }
      const topLevel = element.querySelectorAll<HTMLElement>(TOP_LEVEL_ITEM);
      topLevel.item(last ? topLevel.length - 1 : 0)?.focus();
    };
    root.addEventListener("keydown", handleKeyDown);
    return () => root.removeEventListener("keydown", handleKeyDown);
  }, [element]);

  // Only an open menu, whose element is attached, hides itself; hiding a
  // closed popover does nothing.
  // @note Impure: closes the popover element.
  const hide = useCallback(
    () =>
      assertDefined(
        element,
        "an open menu's popover is attached",
      ).hidePopover(),
    [element],
  );

  const leavesFocusRef = useRef(false);
  // Tab's close leaves focus to the browser, which moves it on.
  // @note Impure: closes the popover.
  const hideLeavingFocus = useCallback(() => {
    leavesFocusRef.current = true;
    hide();
    leavesFocusRef.current = false;
  }, [hide]);

  // Safari does not focus a button on click, so the browser's own focus
  // return can land on <body>: record whether focus was inside.
  // @note Impure: records whether focus was inside.
  const handleBeforeToggle = (event: ToggleEvent<HTMLDivElement>): void => {
    if (event.newState === "closed") {
      hadFocusRef.current =
        !leavesFocusRef.current &&
        event.currentTarget.contains(findActiveElement(event.currentTarget));
    }
    onBeforeToggle?.(event);
  };

  // @note Impure: returns focus to the trigger when the menu closes with
  // focus inside.
  const handleToggle = (event: ToggleEvent<HTMLDivElement>): void => {
    const popover = event.currentTarget;
    readState(popover);
    if (event.newState === "open") setOpenings((count) => count + 1);
    // A close the menu has since reopened from leaves focus to the new list.
    if (event.newState === "closed" && !popover.matches(":popover-open")) {
      setFocusIntent("first");
      if (hadFocusRef.current) {
        hadFocusRef.current = false;
        findTrigger(popover)?.focus();
      }
    }
    onToggle?.(event);
  };

  const scriptOnlySeparators = findScriptOnlySeparators(items);

  // tabIndex -1: a click on the popover outside an item keeps focus inside
  // it, so closing then returns focus to the trigger.
  return (
    <div
      {...props}
      ref={attachElement}
      id={menuId}
      popover="auto"
      tabIndex={-1}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      style={{ ...style, positionAnchor: `--${menuId}` }}
      onBeforeToggle={handleBeforeToggle}
      onToggle={handleToggle}
    >
      {isOpen ? (
        <MenuList
          key={openings}
          items={items}
          onSelect={onSelect}
          // The ids win over the string, as aria-labelledby wins over
          // aria-label, and the trigger names the menu when neither is given.
          label={labelledBy === undefined ? label : undefined}
          labelledBy={
            labelledBy ?? (label === undefined ? triggerId : undefined)
          }
          wrap={wrap}
          focusIntent={focusIntent}
          hide={hide}
          hideLeavingFocus={hideLeavingFocus}
        />
      ) : (
        // Closed, and before hydration: a static list with no listener.
        <div className={LIST_CLASS_NAME}>
          {items.map((entry) =>
            isMenuSeparator(entry) ? (
              <hr
                key={entry.key}
                className={
                  scriptOnlySeparators.has(entry.key)
                    ? "separator script-only"
                    : "separator"
                }
              />
            ) : (
              <Item key={entry.key ?? entry.url} item={entry} />
            ),
          )}
        </div>
      )}
    </div>
  );
}
