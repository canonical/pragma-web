import { DocumentLayout, ModeStrip } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { SiteColophon } from "#lib/ui/SiteColophon";
import { SiteRail } from "#lib/ui/SiteRail";
import type { GuidesLayoutProps } from "./types.js";

/**
 * The Guides lens's page layout: the site rail and colophon around the
 * guides index and a guide's reading page, with an empty strip.
 *
 * The layout is the document archetype: the rail in its rail region, the
 * strip in the top row, the page in the canvas, the one region that
 * scrolls, and the colophon in the band under it. It renders no element of
 * its own: `DocumentLayout` renders the root.
 *
 * `import { GuidesLayout } from "./GuidesLayout/index.js";`
 */
export default function GuidesLayout({
  children,
}: GuidesLayoutProps): ReactElement {
  return (
    <DocumentLayout
      colophon={<SiteColophon />}
      rail={<SiteRail />}
      strip={<ModeStrip />}
    >
      {children}
    </DocumentLayout>
  );
}
