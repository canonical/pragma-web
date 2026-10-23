import {
  DocumentLayout,
  ModeStrip,
  makeLensContext,
} from "@canonical/prism-core";
import type { ReactElement } from "react";
import { SiteRail } from "#lib/SiteRail";
import { SiteColophon } from "#lib/ui/SiteColophon";
import type { MarketingLayoutProps } from "./types.js";

/**
 * The strip's breadcrumb trail: a single `Home` crumb. The lobby has one
 * address, so the lens crumb is the current page.
 */
const HomeContext = makeLensContext({
  lensRouteName: "home",
});

/**
 * The Home lens's page layout: the site rail and colophon around the lobby,
 * with the strip carrying its single `Home` crumb.
 *
 * The layout is the document archetype: the rail in its rail region, the
 * strip in the top row, the page in the canvas, the one region that
 * scrolls, and the colophon in the band under it. It renders no element of
 * its own: `DocumentLayout` renders the root.
 *
 * `import { MarketingLayout } from "./MarketingLayout/index.js";`
 */
export default function MarketingLayout({
  children,
}: MarketingLayoutProps): ReactElement {
  return (
    <DocumentLayout
      colophon={<SiteColophon />}
      rail={<SiteRail />}
      strip={<ModeStrip context={<HomeContext lensLabel="Home" />} />}
    >
      {children}
    </DocumentLayout>
  );
}
