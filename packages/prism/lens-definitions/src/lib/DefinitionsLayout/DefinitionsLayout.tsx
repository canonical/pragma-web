import { Canvas, CanvasSkipLink, ModeStrip } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { LensFilterProvider } from "../LensFilterProvider/index.js";
import { Controls } from "./common/Controls/index.js";
import { SocketGuard } from "./common/SocketGuard/index.js";
import { Status } from "./common/Status/index.js";
import { Trail } from "./common/Trail/index.js";
import type { DefinitionsLayoutProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds definitions-layout";

/**
 * The Definitions lens's page layout: the site's rail and colophon around
 * the explorer, with the strip carrying the breadcrumb trail, the filter
 * chips and the status figure.
 *
 * `LensFilterProvider` encloses the whole layout because the chips in the
 * strip and the explorer in the canvas are siblings that share one filter.
 * The provider lives as long as the layout, which the router remounts
 * whenever the matched route changes: the filter survives a move from one
 * term to another (the same route, new params) and resets on a move to the
 * lens index or to another lens. The chips and the figure read the explorer's
 * own operation from the warm store (`useStripQuery`), each inside its own
 * `SocketGuard`, so a cold store empties their sockets and nothing else.
 *
 * Its root is the layout's own page grid: the rail in the west columns,
 * then a viewport stacking the strip, the canvas and the colophon. The rail
 * and the colophon are the site's own, so a site binds them once, in the
 * wrapper it groups the lens's routes under.
 *
 * `import { DefinitionsLayout } from "@canonical/prism-lens-definitions";`
 */
export default function DefinitionsLayout({
  children,
  className,
  colophon,
  rail,
  ...props
}: DefinitionsLayoutProps): ReactElement {
  return (
    <LensFilterProvider>
      <div
        {...props}
        className={[componentCssClassName, className].filter(Boolean).join(" ")}
      >
        <CanvasSkipLink />
        {rail}
        <div className="viewport">
          <ModeStrip
            context={<Trail />}
            controls={
              <SocketGuard>
                <Controls />
              </SocketGuard>
            }
            status={
              <SocketGuard>
                <Status />
              </SocketGuard>
            }
          />
          <Canvas>{children}</Canvas>
          {colophon}
        </div>
      </div>
    </LensFilterProvider>
  );
}
