import type React from "react";
import type { TagProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds tag";

/**
 * The tag component is a compact, non-interactive visual element used to
 * categorize content or indicate a status. Its primary role is metadata
 * visualization. While it has similar visual properties to the Chip, it is
 * purely informational and does not trigger actions or allow for removal.
 *
 * @implements ds:global.component.tag
 */
const Tag = ({
  children,
  anticipation,
  importance,
  criticality,
  lifecycle,
  className,
  ...props
}: TagProps): React.ReactElement => (
  <span
    className={[
      componentCssClassName,
      anticipation,
      importance,
      criticality,
      lifecycle,
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    {...props}
  >
    {children}
  </span>
);

export default Tag;
