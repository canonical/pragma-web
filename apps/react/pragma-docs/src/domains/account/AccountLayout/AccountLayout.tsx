import { DocumentLayout, ModeStrip } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { SiteColophon } from "#lib/ui/SiteColophon";
import { SiteRail } from "#lib/ui/SiteRail";
import type { AccountLayoutProps } from "./types.js";

/**
 * The account pages' layout: the site rail and colophon around the sign-in
 * and account pages, with an empty strip.
 *
 * The layout is the document archetype: the rail in its rail region, the
 * strip in the top row, the page in the canvas, the one region that
 * scrolls, and the colophon in the band under it. It renders no element of
 * its own: `DocumentLayout` renders the root.
 *
 * `import { AccountLayout } from "./AccountLayout/index.js";`
 */
export default function AccountLayout({
  children,
}: AccountLayoutProps): ReactElement {
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
