import type React from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { createElement } from "react";
import { Icon } from "../../../Icon/index.js";
import { isMenuLink } from "../../utils/index.js";
import type { ItemProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds contextual-menu-item";

/** Whether a modifier key is held. */
const hasModifier = (event: KeyboardEvent | MouseEvent): boolean =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

/** Whether a click asks the browser for something other than following a link. */
const isModifiedClick = (event: MouseEvent): boolean =>
  event.button !== 0 || hasModifier(event);

/**
 * One menu entry: a link when it has a `url`, otherwise an action that
 * waits for scripts. Enter and Space click it; a click chooses it, or
 * opens a parent's submenu.
 *
 * @implements ds:global.subcomponent.contextual-menu-item
 */
export default function Item({
  item,
  itemProps,
  onSelect,
}: ItemProps): React.ReactElement {
  const {
    url,
    label,
    disabled,
    slot,
    icon,
    className,
    displayItemsType,
    Component,
    items,
  } = item;
  // An item with children is a submenu parent; it shows a trailing caret.
  const hasSubmenu = !!items?.length;
  const navOnClick = itemProps?.onClick;

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    // A parent opens its submenu; the tree's own choose would drop the
    // highlight.
    if (hasSubmenu) {
      // A parent with a url opens its submenu rather than following it.
      event.preventDefault();
      onSelect?.(event);
      return;
    }
    navOnClick?.(event);
    if (url !== undefined && isModifiedClick(event)) return;
    onSelect?.(event);
  };

  // @note Impure: Enter and Space click the item, so every way of choosing
  // it takes one path, and a link follows its href. The key stops here, so
  // a Space never starts a type-ahead search.
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key !== "Enter" && event.key !== " ") return;
    // A modified Enter on a link is the browser's: a new tab or window.
    if (
      url !== undefined &&
      !hasSubmenu &&
      event.key === "Enter" &&
      hasModifier(event)
    ) {
      event.stopPropagation();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.click();
  };

  const content =
    displayItemsType === "custom" && Component ? (
      <Component item={item} />
    ) : (
      <>
        {/* Icon always precedes the text (Figma). */}
        {icon ? <span className="icon">{icon}</span> : null}
        <span className="label">{label}</span>
        {slot ? <span className="slot">{slot}</span> : null}
        {/* A submenu parent shows a trailing caret, mirrored in RTL. */}
        {hasSubmenu ? (
          <span className="caret" aria-hidden="true">
            <Icon icon="chevron-right" />
          </span>
        ) : null}
      </>
    );

  // A link is an `<a>`; a disabled one has no href, so like an action it
  // waits for scripts.
  const isLink = isMenuLink(item);
  return createElement(
    url === undefined ? "div" : "a",
    {
      className: [componentCssClassName, !isLink && "script-only", className]
        .filter(Boolean)
        .join(" "),
      ...itemProps,
      ...(itemProps ? { onClick: handleClick, onKeyDown: handleKeyDown } : {}),
      "aria-disabled": disabled ? true : undefined,
      href: isLink ? url : undefined,
    },
    content,
  );
}
