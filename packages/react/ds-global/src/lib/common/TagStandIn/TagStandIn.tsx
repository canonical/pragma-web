import type React from "react";
import type { TagStandInProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds tag";

/**
 * A private stand-in for Tag, which does not exist yet. It renders the
 * read-only `lead: value` the retired static chip used to render and draws
 * the chip's static box — border, tint and small-caps lead — but never
 * reacts to the pointer. It is not exported from the package, and it is
 * deleted once Tag lands.
 */
export default function TagStandIn({
  value,
  lead,
  criticality,
  className,
  ...props
}: TagStandInProps): React.ReactElement {
  return (
    <span
      {...props}
      className={[componentCssClassName, criticality, className]
        .filter(Boolean)
        .join(" ")}
    >
      {lead && <span className="lead">{lead}</span>}
      <span className="value">{value}</span>
    </span>
  );
}
