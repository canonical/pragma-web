import type { WrapperComponentProps } from "@canonical/router-core";
import type { ReactElement, ReactNode } from "react";
import { LensLayout } from "#lib/LensLayout";
import { ModeStrip } from "#lib/ModeStrip";
import { SiteColophon } from "#lib/SiteColophon";
import { SiteRail } from "#lib/SiteRail";
import { JourneyViewProvider } from "../journeyViewContext.js";
import { journeysStripSlots } from "../stripSlots.js";

const { Context, Controls } = journeysStripSlots;

/**
 * The Journeys lens's page layout: the site rail and colophon around the
 * journeys explorer, with the strip carrying the breadcrumb trail and the
 * Table ⇄ Graph view switch.
 *
 * `JourneyViewProvider` encloses the whole layout because the switch in the
 * strip and the explorer in the canvas are siblings that share one view.
 * The provider remounts with the layout, so the view resets whenever the
 * route changes.
 *
 * Renders no element of its own — `LensLayout` owns the root — so its only
 * prop is the routed page.
 *
 * `import { JourneysLayout } from "#addons/journeys";`
 */
export default function JourneysLayout({
  children,
}: WrapperComponentProps<ReactNode>): ReactElement {
  return (
    <JourneyViewProvider>
      <LensLayout
        footer={<SiteColophon />}
        rail={<SiteRail />}
        strip={<ModeStrip context={<Context />} controls={<Controls />} />}
      >
        {children}
      </LensLayout>
    </JourneyViewProvider>
  );
}
