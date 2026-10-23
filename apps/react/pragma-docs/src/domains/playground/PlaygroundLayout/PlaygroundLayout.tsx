import { DocumentLayout, ModeStrip } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { SiteColophon } from "#lib/SiteColophon";
import { SiteRail } from "#lib/SiteRail";
import type { PlaygroundLayoutProps } from "./types.js";

/**
 * The playground's page layout: the site rail and colophon around the demo
 * canvas, with an empty strip.
 *
 * The layout is the document archetype: the rail in its rail region, the
 * strip in the top row, the page in the canvas, the one region that
 * scrolls, and the colophon in the band under it. It renders no element of
 * its own: `DocumentLayout` renders the root.
 *
 * `import { PlaygroundLayout } from "./PlaygroundLayout/index.js";`
 */
export default function PlaygroundLayout({
  children,
}: PlaygroundLayoutProps): ReactElement {
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
