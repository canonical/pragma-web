import { Icon } from "@canonical/react-ds-global";
import type { MouseEvent, ReactElement } from "react";
import { IconButtonStandIn } from "../../../../common/IconButtonStandIn/index.js";
import type { PageControlProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds page-control";

/**
 * Whether a click means "go here, in this tab": a plain primary click. A
 * modified click or another button keeps the link's own behaviour.
 */
const isPlainClick = (event: MouseEvent<HTMLAnchorElement>): boolean =>
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey;

/**
 * One way to another page: a link where the page is reachable, an icon
 * button otherwise.
 *
 * A link renders through the consumer's router link where one is given, and
 * a button with no destination is hidden until scripting is enabled.
 */
export default function PageControl({
  label,
  icon,
  className,
  destination,
  reachable,
  onNavigate,
  LinkComponent,
}: PageControlProps): ReactElement {
  if (reachable && destination !== null) {
    const href = `?${destination}`;
    const linkClassName = [componentCssClassName, className].join(" ");
    // The icon names the link: the shared link contract carries no
    // attribute for a name, and the name from content reaches every router.
    const content = (
      <span className="icon">
        <Icon icon={icon} aria-label={label} />
      </span>
    );
    if (LinkComponent === "a") {
      return (
        <a
          className={linkClassName}
          href={href}
          onClick={(event) => {
            if (isPlainClick(event)) {
              event.preventDefault();
              onNavigate();
            }
          }}
        >
          {content}
        </a>
      );
    }
    return (
      <LinkComponent href={href} className={linkClassName}>
        {content}
      </LinkComponent>
    );
  }
  return (
    <IconButtonStandIn
      type="button"
      importance="tertiary"
      icon={icon}
      className={[destination === null && "scripted", className]
        .filter(Boolean)
        .join(" ")}
      aria-label={label}
      disabled={!reachable}
      onClick={onNavigate}
    />
  );
}
