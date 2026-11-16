import type React from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import type { MenuItemProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds dropdown-button-menu-item";

/** Whether a click asks the browser for something other than following a link. */
const isModifiedClick = (event: MouseEvent): boolean =>
  event.button !== 0 ||
  event.metaKey ||
  event.ctrlKey ||
  event.shiftKey ||
  event.altKey;

/**
 * One item of a DropdownPanel.Menu: a link for an item with a `url`, a script-
 * only `<div>` otherwise.
 * Enter, Space and a plain primary click choose it; a modified click on a link
 * is left to the browser.
 */
export default function MenuItem({
  item,
  itemProps,
  onSelect,
}: MenuItemProps): React.ReactElement {
  const { url, label, disabled, icon, slot, className, displayItemsType } =
    item;
  const CustomItem = displayItemsType === "custom" ? item.Component : undefined;
  const navOnClick = itemProps?.onClick;

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    navOnClick?.(event);
    if (disabled) {
      event.preventDefault();
      return;
    }
    if (url !== undefined && isModifiedClick(event)) return;
    onSelect?.(event);
  };

  // @note Impure: Enter and Space click the item, so every way of choosing
  // it takes one path, and a link follows its href.
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.click();
  };

  const content = CustomItem ? (
    <CustomItem item={item} />
  ) : (
    <>
      {icon ? <span className="icon">{icon}</span> : null}
      <span className="label">{label}</span>
      {slot ? <span className="slot">{slot}</span> : null}
    </>
  );

  const rootProps = {
    className: [componentCssClassName, disabled && "disabled", className]
      .filter(Boolean)
      .join(" "),
    ...itemProps,
    ...(onSelect ? { onClick: handleClick, onKeyDown: handleKeyDown } : {}),
  };

  if (url !== undefined) {
    return (
      <a {...rootProps} href={disabled ? undefined : url}>
        {content}
      </a>
    );
  }

  return (
    <div {...rootProps} data-requires-script="">
      {content}
    </div>
  );
}
