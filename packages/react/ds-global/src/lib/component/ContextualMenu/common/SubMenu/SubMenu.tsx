import type { _Item } from "@canonical/ds-types";
import { getItemId } from "@canonical/ds-utils";
import type { HTMLAttributes, ReactElement } from "react";
import { useContext, useId, useState } from "react";
import type { MenuEntry } from "../../types.js";
import {
  assertDefined,
  formatIdent,
  isMenuItemDisabled,
  isMenuSeparator,
} from "../../utils/index.js";
import { Item } from "../Item/index.js";
import MenuContext from "../MenuContext.js";
import type { SubMenuProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds contextual-menu-submenu";

/**
 * One node of an open menu: a separator, a leaf item, or a submenu parent
 * and its nested `role="menu"`, shown while the highlight is below the
 * parent or the pointer is over it, and anchored beside it.
 *
 * @implements ds:global.subcomponent.contextual-menu-submenu
 */
export default function SubMenu({ item }: SubMenuProps): ReactElement {
  const {
    getItemProps,
    getMenuProps,
    getNodeStatus,
    highlightItem,
    chooseItem,
  } = assertDefined(
    useContext(MenuContext),
    "a menu node renders inside an open menu",
  );
  const [hovered, setHovered] = useState(false);
  const submenuId = formatIdent(useId());

  if (isMenuSeparator(item)) {
    // <hr> carries the implicit `role="separator"` WAI-ARIA menus expect.
    return <hr className="separator" />;
  }

  // The tree holds a disabled item's flag apart; the item reads it back.
  const disabled = isMenuItemDisabled(item);
  const shown = disabled ? { ...item, disabled } : item;

  if (!item.items?.length) {
    return (
      <Item
        item={shown}
        itemProps={getItemProps(item)}
        onSelect={(event) => chooseItem(item, event)}
      />
    );
  }

  // A submenu's children include separators, which `_Item<MenuItem>` drops.
  const children = item.items as _Item<MenuEntry>[];
  const status = getNodeStatus(item);
  // Open from the keyboard when the highlight is in a descendant, not on the
  // parent itself, so ArrowLeft back onto the parent closes it.
  // A disabled parent keeps its submenu shut.
  const open =
    !disabled &&
    ((status.inHighlightedBranch && !status.highlighted) || hovered);
  const anchorName = `--${submenuId}`;

  const itemProps = {
    ...getItemProps(item),
    // The tree reports only the keyboard branch; a hovered submenu is open too.
    "aria-expanded": open,
    // A closed submenu is not rendered, so nothing to point at.
    "aria-controls": open ? submenuId : undefined,
    style: { anchorName },
  };

  const menuProps = getMenuProps({
    label: item.label,
  }) as HTMLAttributes<HTMLDivElement>;

  return (
    <div
      className={[componentCssClassName].filter(Boolean).join(" ")}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Choosing a parent opens its submenu on its first item. */}
      <Item
        item={shown}
        itemProps={itemProps}
        onSelect={() => {
          const first = children.find((child) => !isMenuSeparator(child));
          if (first) highlightItem(first);
        }}
      />
      {open ? (
        <div
          {...menuProps}
          id={submenuId}
          className="submenu"
          style={{ positionAnchor: anchorName }}
        >
          {children.map((child) => (
            <SubMenu key={getItemId(child)} item={child} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
