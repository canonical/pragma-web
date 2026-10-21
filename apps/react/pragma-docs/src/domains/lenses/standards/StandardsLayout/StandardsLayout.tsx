import type { WrapperComponentProps } from "@canonical/router-core";
import type { ReactElement, ReactNode } from "react";
import { makeLensContext } from "#lib/LensBreadcrumbs";
import { LensLayout } from "#lib/LensLayout";
import { ModeStrip } from "#lib/ModeStrip";
import { SiteColophon } from "#lib/SiteColophon";
import { SiteRail } from "#lib/SiteRail";

/**
 * The strip's breadcrumb trail: `Standards` on the index, `Standards / <uri>`
 * on a reading page. The reading crumb is the `:uri` route param (the
 * entity's absolute IRI), so the trail reads no query.
 */
const StandardsContext = makeLensContext({
  lensLabel: "Standards",
  lensRouteName: "standards",
  paramKey: "uri",
});

/**
 * The Standards lens's page layout: the site rail and colophon around the
 * index and reading pages, with the strip carrying the breadcrumb trail.
 *
 * Renders no element of its own — `LensLayout` owns the root — so its only
 * prop is the routed page.
 *
 * `import { StandardsLayout } from "#domains/lenses/standards";`
 */
export default function StandardsLayout({
  children,
}: WrapperComponentProps<ReactNode>): ReactElement {
  return (
    <LensLayout
      footer={<SiteColophon />}
      rail={<SiteRail />}
      strip={<ModeStrip context={<StandardsContext />} />}
    >
      {children}
    </LensLayout>
  );
}
