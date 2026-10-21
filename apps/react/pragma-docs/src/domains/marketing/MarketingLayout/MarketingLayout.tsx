import type { WrapperComponentProps } from "@canonical/router-core";
import type { ReactElement, ReactNode } from "react";
import { makeLensContext } from "#lib/LensBreadcrumbs";
import { LensLayout } from "#lib/LensLayout";
import { ModeStrip } from "#lib/ModeStrip";
import { SiteColophon } from "#lib/SiteColophon";
import { SiteRail } from "#lib/SiteRail";

/**
 * The strip's breadcrumb trail: a single `Home` crumb. The lobby has one
 * address, so the lens crumb is the current page.
 */
const HomeContext = makeLensContext({
  lensLabel: "Home",
  lensRouteName: "home",
});

/**
 * The Home lens's page layout: the site rail and colophon around the lobby,
 * with the strip carrying its single `Home` crumb.
 *
 * Renders no element of its own — `LensLayout` owns the root — so its only
 * prop is the routed page.
 *
 * `import { MarketingLayout } from "#domains/marketing";`
 */
export default function MarketingLayout({
  children,
}: WrapperComponentProps<ReactNode>): ReactElement {
  return (
    <LensLayout
      footer={<SiteColophon />}
      rail={<SiteRail />}
      strip={<ModeStrip context={<HomeContext />} />}
    >
      {children}
    </LensLayout>
  );
}
