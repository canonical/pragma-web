import type React from "react";
import { tabsDensityPolicy } from "../densityPolicy.js";
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
  const { url, label, disabled, className, slot } = item;
  const Link = LinkComponent;
  const inert = !url;
  const hasSlot = slot !== null && slot !== undefined && slot !== false;
  const linkClassName = [
    "ds tabs-link spacing-control-seat stroke-paint stroke-block-end",
    hasSlot && tabsDensityPolicy.providerClassName,
  ]
    .filter(Boolean)
    .join(" ");
  const content = (
    <>
      {hasSlot ? <span className="tabs-label">{label}</span> : label}
      {hasSlot ? " " : null}
      {hasSlot ? <span className="tabs-indicator">{slot}</span> : null}
    </>
  );
  const densityProps = hasSlot
    ? {
        "data-ds-density-provider": tabsDensityPolicy.provider,
        "data-ds-density-policy-version": tabsDensityPolicy.version,
      }
    : {};
  const linkDensityProps = LinkComponent === "a" ? densityProps : {};
  return (
    <li
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-active={active || undefined}
      data-inert={inert || undefined}
      data-disabled={disabled || undefined}
    >
      {url ? (
        <Link
          className={linkClassName}
          {...linkDensityProps}
          href={disabled ? undefined : url}
          aria-current={active ? "page" : undefined}
        >
          {content}
        </Link>
      ) : (
        <span
          className={linkClassName}
          {...densityProps}
          aria-current={active ? "page" : undefined}
        >
          {content}
        </span>
      )}
    </li>
  );
};

export default Item;
