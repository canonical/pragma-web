// Scaffolded by @canonical/summon-component:react v0.43.0

import { ClientOnly } from "@canonical/prism-core";
import { Button } from "@canonical/react-ds-global";
import { type CSSProperties, type ReactElement, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment, {
  type RouteStrip_node$data,
} from "#relay/__generated__/RouteStrip_node.graphql.js";
import { CallStop } from "../CallStop/index.js";
import type { RouteStripProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields RouteStrip reads from the Route it renders: its label, whether
 * it loops, and its calls with their positions, each as its CallStop reads
 * it; the same of its reverse, when the line runs both ways.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment RouteStrip_node on Route {
    label
    isLoop
    calls {
      position
      ...CallStop_node
    }
    reverse {
      label
      calls {
        position
        ...CallStop_node
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds route-strip";

/** One direction the strip shows: its label and its calls. */
type Direction = Pick<RouteStrip_node$data, "label" | "calls">;

/**
 * One route of a line as a passenger reads it above the doors: its calls in
 * order on one rule in the line's colour, each a `CallStop`. A loop shows a
 * "continues" marker at both ends. Below two groups of columns the strip
 * turns vertical.
 *
 * Where the line runs both ways, the server renders both directions, so the
 * page reads in full without script; once hydrated, a toggle shows one
 * direction at a time.
 *
 * Native props reach the `<section>` root; a consumer `className` merges
 * after the projection's own.
 *
 * `import { RouteStrip } from "./RouteStrip/index.js";`
 *
 * @implements metro.component.route_strip
 * @note Impure: reads its route from the Relay store and its words from the
 *   translator in scope.
 */
export default function RouteStrip({
  node,
  lineUri,
  colour,
  className,
  style,
  ...props
}: RouteStripProps): ReactElement {
  const t = useMessages();
  const route = useFragment(nodeFragment, node);
  const [showsReverse, setShowsReverse] = useState(false);
  const { reverse } = route;
  const directions: readonly Direction[] =
    reverse === null || reverse === undefined ? [route] : [route, reverse];

  const renderContinues = (): ReactElement | null =>
    route.isLoop ? (
      <li aria-hidden="true" className="continues">
        {t("network.strip.continues")}
      </li>
    ) : null;

  const renderDirection = (direction: Direction): ReactElement => (
    <div className="direction" key={direction.label}>
      <h2>{direction.label}</h2>
      <div className="track">
        <span aria-hidden="true" className="rule" />
        <ol className="stops">
          {renderContinues()}
          {[...direction.calls]
            .sort((a, b) => a.position - b.position)
            .map((call) => (
              <CallStop
                className="stop"
                colour={colour}
                key={call.position}
                lineUri={lineUri}
                node={call}
              />
            ))}
          {renderContinues()}
        </ol>
      </div>
    </div>
  );

  return (
    <section
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      style={{ ...style, "--route-strip-colour": colour } as CSSProperties}
    >
      {directions.length === 1 ? (
        renderDirection(route)
      ) : (
        <ClientOnly fallback={directions.map(renderDirection)}>
          <fieldset
            aria-label={t("network.strip.direction")}
            className="toggle"
          >
            {directions.map((direction, index) => (
              <Button
                aria-pressed={showsReverse === (index === 1)}
                importance={
                  showsReverse === (index === 1) ? "primary" : "secondary"
                }
                key={direction.label}
                onClick={() => setShowsReverse(index === 1)}
                type="button"
              >
                {direction.label}
              </Button>
            ))}
          </fieldset>
          {renderDirection(directions[showsReverse ? 1 : 0] ?? route)}
        </ClientOnly>
      )}
    </section>
  );
}
