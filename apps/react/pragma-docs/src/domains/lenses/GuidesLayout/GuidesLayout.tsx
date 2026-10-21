import type { WrapperComponentProps } from "@canonical/router-core";
import type { ReactElement, ReactNode } from "react";
import { LensLayout } from "#lib/LensLayout";
import { ModeStrip } from "#lib/ModeStrip";
import { SiteColophon } from "#lib/SiteColophon";
import { SiteRail } from "#lib/SiteRail";

/**
 * The Guides lens's page layout: the site rail and colophon around the
 * guides index and a guide's reading page, with an empty strip.
 *
 * Renders no element of its own — `LensLayout` owns the root — so its only
 * prop is the routed page.
 *
 * `import { GuidesLayout } from "#domains/lenses";`
 */
export default function GuidesLayout({
  children,
}: WrapperComponentProps<ReactNode>): ReactElement {
  return (
    <LensLayout
      footer={<SiteColophon />}
      rail={<SiteRail />}
      strip={<ModeStrip />}
    >
      {children}
    </LensLayout>
  );
}
