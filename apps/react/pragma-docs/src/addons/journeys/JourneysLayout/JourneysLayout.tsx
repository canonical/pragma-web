import { DocumentLayout, ModeStrip } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { SiteRail } from "#lib/SiteRail";
import { SiteColophon } from "#lib/ui/SiteColophon";
import { JourneyViewProvider } from "../journeyViewContext.js";
import { journeysStripSlots } from "../stripSlots.js";
import type { JourneysLayoutProps } from "./types.js";

const { Context, Controls } = journeysStripSlots;

/**
 * The Journeys lens's page layout: the site rail and colophon around the
 * journeys explorer, with the strip carrying the breadcrumb trail and the
 * Table ⇄ Graph view switch.
 *
 * `JourneyViewProvider` encloses the whole layout because the switch in the
 * strip and the explorer in the canvas are siblings that share one view.
 * The provider lives as long as the layout, which the router remounts
 * whenever the matched route changes: the view survives a move from one
 * job to another (the same route, new params) and resets on a move to the
 * lens index or to another lens.
 *
 * The layout is the document archetype: the rail in its rail region, the
 * strip in the top row, the page in the canvas, the one region that
 * scrolls, and the colophon in the band under it. It renders no element of
 * its own: `DocumentLayout` renders the root.
 *
 * `import { JourneysLayout } from "./JourneysLayout/index.js";`
 */
export default function JourneysLayout({
  children,
}: JourneysLayoutProps): ReactElement {
  return (
    <JourneyViewProvider>
      <DocumentLayout
        colophon={<SiteColophon />}
        rail={<SiteRail />}
        strip={
          <ModeStrip
            context={<Context lensLabel="Journeys" />}
            controls={<Controls />}
          />
        }
      >
        {children}
      </DocumentLayout>
    </JourneyViewProvider>
  );
}
