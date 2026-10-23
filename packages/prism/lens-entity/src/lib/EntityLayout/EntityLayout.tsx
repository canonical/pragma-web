import { DocumentLayout, ModeStrip } from "@canonical/prism-core";
import { useRouterState } from "@canonical/router-react";
import type { ReactElement } from "react";
import { EntityFilterProvider } from "../EntityFilterProvider/index.js";
import { EntityControls } from "./common/EntityControls/index.js";
import { EntityStatus } from "./common/EntityStatus/index.js";
import { SocketGuard } from "./common/SocketGuard/index.js";
import { Trail } from "./common/Trail/index.js";
import type { EntityLayoutProps } from "./types.js";

/**
 * The entity lens's page layout: the site's rail and colophon around the
 * routed page, with the strip carrying the breadcrumb trail and, on the
 * index, the search box and the count of entries shown.
 *
 * `EntityFilterProvider` encloses the whole layout because the strip's
 * search box and the index in the canvas are siblings that share one
 * filter.
 * The router remounts the layout whenever the matched route changes, so the
 * filter starts from its default on every visit to the index.
 *
 * The controls and the status render only on the index route (the route
 * named after the binding): on an entity page there is nothing to filter.
 * The status reads the index's own operation from the warm store inside a
 * `SocketGuard`, so a cold store empties its socket and nothing else; the
 * trail reads only the URL.
 *
 * The layout is the document archetype: the rail in its rail region, the
 * strip in the top row, the routed page in the canvas, the one region that
 * scrolls, and the colophon in the band under it. The rail and the colophon
 * are the site's own, so a site binds them once, in the wrapper it groups
 * the lens's routes under. The layout renders no element of its own:
 * `DocumentLayout` renders the root, and the layout's native props reach it.
 *
 * `import { EntityLayout } from "@canonical/prism-lens-entity";`
 */
export default function EntityLayout({
  binding,
  children,
  label,
  ...props
}: EntityLayoutProps): ReactElement {
  const { match } = useRouterState();
  const onIndex = match?.kind === "route" && match.name === binding.id;
  return (
    <EntityFilterProvider>
      <DocumentLayout
        {...props}
        strip={
          <ModeStrip
            context={<Trail binding={binding} label={label} />}
            controls={onIndex ? <EntityControls /> : null}
            status={
              onIndex ? (
                <SocketGuard>
                  <EntityStatus binding={binding} />
                </SocketGuard>
              ) : null
            }
          />
        }
      >
        {children}
      </DocumentLayout>
    </EntityFilterProvider>
  );
}
