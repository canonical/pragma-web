import type React from "react";
import type { ItemProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds tabs-item";

/**
 * Tabs Item — the internal renderer for a single tab. Not a public
 * subcomponent: Tabs iterates `navigationRoot.items` and renders one of these
 * per child.
 *
 * Renders an `<li>` whose content is a link when the item has a `url` (via the
 * `LinkComponent`, default `"a"`) or inert text otherwise — never a button.
 * The active tab is marked `aria-current="page"`.
 */
const Item = ({
  item,
  active,
  LinkComponent,
}: ItemProps): React.ReactElement => {
  const { url, label, disabled, className } = item;
  const Link = LinkComponent;
  const inert = !url;
  return (
    <li
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-active={active || undefined}
      data-inert={inert || undefined}
      data-disabled={disabled || undefined}
    >
      {url ? (
        <Link
          className="ds tabs-link spacing-control-seat stroke-paint stroke-block-end"
          href={disabled ? undefined : url}
          aria-current={active ? "page" : undefined}
        >
          {label}
        </Link>
      ) : (
        <span
          className="ds tabs-link spacing-control-seat stroke-paint stroke-block-end"
          aria-current={active ? "page" : undefined}
        >
          {label}
        </span>
      )}
    </li>
  );
};

export default Item;
