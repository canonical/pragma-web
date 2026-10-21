import type { WrapperComponentProps } from "@canonical/router-core";
import type { ReactElement, ReactNode } from "react";
import { makeLensContext } from "#lib/LensBreadcrumbs";
import { LensLayout } from "#lib/LensLayout";
import { ModeStrip } from "#lib/ModeStrip";
import { SiteColophon } from "#lib/SiteColophon";
import { SiteRail } from "#lib/SiteRail";

/**
 * The strip's breadcrumb trail: `Components` on the catalog,
 * `Components / <uri>` on an entity page. The entity crumb is the `:uri`
 * route param (the prefixed URI), so the trail reads no query.
 */
const ComponentsContext = makeLensContext({
  lensLabel: "Components",
  lensRouteName: "components",
  paramKey: "uri",
});

/**
 * The Components lens's page layout: the site rail and colophon around the
 * catalog and entity pages, with the strip carrying the breadcrumb trail.
 *
 * Renders no element of its own — `LensLayout` owns the root — so its only
 * prop is the routed page.
 *
 * `import { ComponentsLayout } from "#domains/components";`
 */
export default function ComponentsLayout({
  children,
}: WrapperComponentProps<ReactNode>): ReactElement {
  return (
    <LensLayout
      footer={<SiteColophon />}
      rail={<SiteRail />}
      strip={<ModeStrip context={<ComponentsContext />} />}
    >
      {children}
    </LensLayout>
  );
}
