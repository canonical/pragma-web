import { NodeCard } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import type { StationCardProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds station-card";

/**
 * The card of a station: the `Node` projection's card, marked as a station
 * so the site's stylesheet gives it the network's accent, with an
 * `interchange` modifier on the interchanges, the station subclass the
 * graph serves as its own type.
 *
 * It is a site arm: the card map renders it for the types it is mapped to,
 * over the `Node` projection's key, and hands it the node's typename. It
 * renders no root of its own: `NodeCard` renders the root, and every prop
 * but the class names reaches it unchanged.
 *
 * `import { StationCard } from "./StationCard/index.js";`
 */
export default function StationCard({
  className,
  typename,
  ...props
}: StationCardProps): ReactElement {
  return (
    <NodeCard
      {...props}
      className={[
        componentCssClassName,
        typename === "Interchange" && "interchange",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
