import { Icon } from "@canonical/react-ds-global";
import type { ReactElement, ReactNode } from "react";
import type { TimelineMarker } from "../../types.js";
import type { MarkerProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-timeline-marker";

const USER_ICON = (
  <span className="icon">
    <Icon icon="user" />
  </span>
);

const drawGraphic = (marker: TimelineMarker | undefined): ReactNode => {
  if (marker?.customGraphic !== undefined) {
    return marker.customGraphic;
  }
  if (marker?.imageUrl !== undefined) {
    return marker.alt === undefined ? (
      USER_ICON
    ) : (
      <img className="image" src={marker.imageUrl} alt={marker.alt} />
    );
  }
  return marker?.icon ?? marker?.initials ?? USER_ICON;
};

/**
 * The graphic standing for one event on the timeline's axis: an image,
 * initials or an icon on a large or medium marker, and none on a small one.
 */
export default function Marker({
  size,
  marker,
  href,
  label,
  redundant = false,
}: MarkerProps): ReactElement {
  const graphic = size === "small" ? null : drawGraphic(marker);
  const linked = graphic !== null && href !== undefined && label !== undefined;
  return (
    <span className={[componentCssClassName, size].join(" ")}>
      {linked ? (
        <a
          className="link"
          href={href}
          {...(redundant
            ? { "aria-hidden": true, tabIndex: -1 }
            : { "aria-label": label })}
        >
          {graphic}
        </a>
      ) : (
        graphic
      )}
    </span>
  );
}
