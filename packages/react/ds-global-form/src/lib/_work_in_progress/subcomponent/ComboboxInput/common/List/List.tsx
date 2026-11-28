import type React from "react";
import { useEffect, useRef } from "react";
import mergeRefs from "../../../../../utils/mergeRefs.js";
import type { ListProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds combobox-list";

const List = ({
  className,
  style,
  items,
  getMenuProps,
  getItemProps,
  highlightedIndex,
  convertItemToString,
  fieldValue,
  valueKey,
  isOpen,
  "aria-label": ariaLabel,
}: ListProps): React.ReactElement => {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    try {
      if (isOpen) {
        el.showPopover();
      } else {
        el.hidePopover();
      }
    } catch {
      // popover API not supported or already in target state
    }
  }, [isOpen]);

  // In multiple mode the options are a multi-selectable listbox: each one's
  // `aria-selected` says whether it is chosen, as the WAI-ARIA listbox pattern
  // asks, and `aria-activedescendant` alone points at the highlight. A single
  // combobox keeps downshift's `aria-selected`, which follows the highlight.
  const isMultiple = Array.isArray(fieldValue);

  const { ref: menuRef, ...menuProps } = getMenuProps({
    "aria-label": ariaLabel,
    "aria-multiselectable": isMultiple || undefined,
  });

  return (
    <ul
      ref={mergeRefs(listRef, menuRef)}
      popover="manual"
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      style={style}
      {...menuProps}
    >
      {items.map((item, index) => {
        const keyValue = item[valueKey];
        const key = keyValue !== undefined ? String(keyValue) : `item-${index}`;
        let isSelected = false;

        if (fieldValue !== undefined) {
          if (Array.isArray(fieldValue)) {
            isSelected = fieldValue.includes(String(keyValue));
          } else {
            isSelected = fieldValue === String(keyValue);
          }
        }
        return (
          <li
            {...getItemProps({
              item,
              index,
              ...(isMultiple && { "aria-selected": isSelected }),
            })}
            className={[
              "p",
              highlightedIndex === index && "highlighted",
              isSelected && "selected",
            ]
              .filter(Boolean)
              .join(" ")}
            key={key}
          >
            {convertItemToString(item)}
          </li>
        );
      })}
    </ul>
  );
};

export default List;
