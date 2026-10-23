import { ModeStrip, WorkspaceLayout } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { LensFilterProvider } from "../LensFilterProvider/index.js";
import { Controls } from "./common/Controls/index.js";
import { SocketGuard } from "./common/SocketGuard/index.js";
import { Status } from "./common/Status/index.js";
import { Trail } from "./common/Trail/index.js";
import type { DefinitionsLayoutProps } from "./types.js";

/**
 * The Definitions lens's page layout: the workspace archetype, with the
 * site's rail and the explorer in the canvas, and the strip carrying the
 * breadcrumb trail, the filter chips and the status figure.
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
 * The rail is the site's own, so a site binds it once, in the wrapper it
 * groups the lens's routes under. The layout renders no element of its own:
 * `WorkspaceLayout` renders the root, and the layout's native props reach it.
 *
 * `import { DefinitionsLayout } from "@canonical/prism-lens-definitions";`
 */
export default function DefinitionsLayout({
  children,
  rail,
  ...props
}: DefinitionsLayoutProps): ReactElement {
  return (
    <LensFilterProvider>
      <WorkspaceLayout
        {...props}
        rail={rail}
        strip={
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
        }
      >
        {children}
      </WorkspaceLayout>
    </LensFilterProvider>
  );
}
