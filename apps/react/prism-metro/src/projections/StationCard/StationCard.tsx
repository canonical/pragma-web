import { defaultProjectionMaps } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import type { StationCardProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds station-card";

const NodeCard = defaultProjectionMaps.card.Node;

/**
 * The card of a station: the `Node` arm's card, its title and its compact
 * address, marked as a station so the site's stylesheet gives it the
 * network's accent, with an `interchange` modifier on the interchanges, the
 * station subclass the graph serves as its own type.
 *
 * It renders no root of its own: the `Node` arm renders the `<article>`, and
 * every prop but the class names reaches it unchanged.
 *
 * `import { StationCard } from "./StationCard/index.js";`
 */
export default function StationCard({
  className,
  node,
  ...props
}: StationCardProps): ReactElement {
  return (
    <NodeCard
      {...props}
      className={[
        componentCssClassName,
        node.__typename === "Interchange" && "interchange",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      node={node}
    />
  );
}
