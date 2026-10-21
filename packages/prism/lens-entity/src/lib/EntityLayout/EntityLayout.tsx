import { Canvas, CanvasSkipLink, ModeStrip } from "@canonical/prism-core";
import { useRouterState } from "@canonical/router-react";
import type { ReactElement } from "react";
import { EntityFilterProvider } from "../EntityFilterProvider/index.js";
import { Controls } from "./common/Controls/index.js";
import { SocketGuard } from "./common/SocketGuard/index.js";
import { Status } from "./common/Status/index.js";
import { Trail } from "./common/Trail/index.js";
import type { EntityLayoutProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds entity-layout";

/**
 * The entity lens's page layout: the site's rail and colophon around the
 * routed page, with the strip carrying the breadcrumb trail and, on the
 * index, the search box, the view toggle and the count of entries shown.
 *
 * `EntityFilterProvider` encloses the whole layout because the strip's
 * controls and the index in the canvas are siblings that share one filter.
 * The router remounts the layout whenever the matched route changes, so the
 * filter starts from its default on every visit to the index.
 *
 * The controls and the status render only on the index route (the route
 * named after the binding): on an entity page there is nothing to filter.
 * The status reads the index's own operation from the warm store inside a
 * `SocketGuard`, so a cold store empties its socket and nothing else; the
 * trail reads only the URL.
 *
 * Its root is the layout's own page grid: the rail in the west columns,
 * then a viewport stacking the strip, the canvas and the colophon. The rail
 * and the colophon are the site's own, so a site binds them once, in the
 * wrapper it groups the lens's routes under.
 *
 * `import { EntityLayout } from "@canonical/prism-lens-entity";`
 */
export default function EntityLayout({
  binding,
  children,
  className,
  colophon,
  label,
  rail,
  ...props
}: EntityLayoutProps): ReactElement {
  const { match } = useRouterState();
  const onIndex = match?.kind === "route" && match.name === binding.id;
  return (
    <EntityFilterProvider>
      <div
        {...props}
        className={[componentCssClassName, className].filter(Boolean).join(" ")}
      >
        <CanvasSkipLink />
        {rail}
        <div className="viewport">
          <ModeStrip
            context={<Trail binding={binding} label={label} />}
            controls={onIndex ? <Controls /> : null}
            status={
              onIndex ? (
                <SocketGuard>
                  <Status binding={binding} />
                </SocketGuard>
              ) : null
            }
          />
          <Canvas>{children}</Canvas>
          {colophon}
        </div>
      </div>
    </EntityFilterProvider>
  );
}
