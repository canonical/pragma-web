import { Icon } from "@canonical/react-ds-global";
import type React from "react";
import { navigationDensityPolicy } from "../densityPolicy.js";
import type { ItemProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds side-navigation-item";

/**
 * SideNavigation.Item — the default renderer for a single navigation item.
 *
 * A flat leaf row, NOT recursive — an entry with children is a
 * SideNavigation.ItemExpandable instead. The row is
 * `[icon] [content] [end]` over a shared grid template (so the icon aligns
 * with the header logo). An item with a `url` renders as a link via
 * `LinkComponent` (default `"a"`); otherwise a non-navigable label. The end
 * slot is the optional `slot` (a badge, count, …), or nothing. Content is
 * composed via `children`, matching `Button`'s own convention — pass
 * anything, not only text.
 *
 * @implements ds:apps.subcomponent.side-navigation-item
 */
const Item = ({
  url,
  children,
  icon,
  slot,
  disabled = false,
  active = false,
  LinkComponent = "a",
  className,
  ...props
}: ItemProps): React.ReactElement => {
  const Link = LinkComponent;

  const content = (
    <>
      {/* Start cell is always rendered (empty when no icon) so content
          stays in the middle column — labels align with or without icons. */}
      <span className="start">{icon ? <Icon icon={icon} /> : null}</span>
      {/* `title` — native-tooltip fallback for the truncated label,
          not the custom 800ms-delay one. Only meaningful when `children` is
          plain text. */}
      <span
        className="ds side-navigation-label spacing-control-seat"
        title={typeof children === "string" ? children : undefined}
      >
        {children}
      </span>
      {slot ? <span className="end slot">{slot}</span> : null}
    </>
  );

  return (
    <li
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-disabled={disabled || undefined}
      data-active={active || undefined}
      {...props}
    >
      {url ? (
        <Link
          className={`ds row spacing-control-seat-metrics ${navigationDensityPolicy.providerClassName}`}
          data-ds-density-provider={navigationDensityPolicy.provider}
          data-ds-density-policy-version={navigationDensityPolicy.version}
          href={disabled ? undefined : url}
          aria-current={active ? "page" : undefined}
        >
          {content}
        </Link>
      ) : (
        <span
          className={`ds row spacing-control-seat-metrics ${navigationDensityPolicy.providerClassName}`}
          data-ds-density-provider={navigationDensityPolicy.provider}
          data-ds-density-policy-version={navigationDensityPolicy.version}
          aria-current={active ? "page" : undefined}
        >
          {content}
        </span>
      )}
    </li>
  );
};

export default Item;
