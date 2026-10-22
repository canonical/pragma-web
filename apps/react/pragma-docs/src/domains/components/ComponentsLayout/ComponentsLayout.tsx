import {
  DocumentLayout,
  ModeStrip,
  makeLensContext,
} from "@canonical/prism-core";
import type { ReactElement } from "react";
import { SiteColophon } from "#lib/SiteColophon";
import { SiteRail } from "#lib/SiteRail";
import type { ComponentsLayoutProps } from "./types.js";

/**
 * The strip's breadcrumb trail: `Components` on the catalog,
 * `Components / <uri>` on an entity page. The entity crumb is the `:uri`
 * route param (the prefixed URI), so the trail reads no query.
 */
const ComponentsContext = makeLensContext({
  lensRouteName: "components",
  paramKey: "uri",
});

/**
 * The Components lens's page layout: the site rail and colophon around the
 * catalog and entity pages, with the strip carrying the breadcrumb trail.
 *
 * The layout is the document archetype: the rail in its rail region, the
 * strip in the top row, the page in the canvas, the one region that
 * scrolls, and the colophon in the band under it. It renders no element of
 * its own: `DocumentLayout` renders the root.
 *
 * `import { ComponentsLayout } from "./ComponentsLayout/index.js";`
 */
export default function ComponentsLayout({
  children,
}: ComponentsLayoutProps): ReactElement {
  return (
    <DocumentLayout
      colophon={<SiteColophon />}
      rail={<SiteRail />}
      strip={
        <ModeStrip context={<ComponentsContext lensLabel="Components" />} />
      }
    >
      {children}
    </DocumentLayout>
  );
}
