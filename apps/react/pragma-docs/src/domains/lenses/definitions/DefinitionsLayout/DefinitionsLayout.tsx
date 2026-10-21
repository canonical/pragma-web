import type { WrapperComponentProps } from "@canonical/router-core";
import type { ReactElement, ReactNode } from "react";
import { LensLayout } from "#lib/LensLayout";
import { ModeStrip } from "#lib/ModeStrip";
import { SiteColophon } from "#lib/SiteColophon";
import { SiteRail } from "#lib/SiteRail";
import { LensFilterProvider } from "../lensFilterContext.js";
import { definitionsStripSlots } from "../stripSlots.js";

const { Context, Controls, Status } = definitionsStripSlots;

/**
 * The Definitions lens's page layout: the site rail and colophon around the
 * explorer, with the strip carrying the breadcrumb trail, the filter chips
 * and the status figure.
 *
 * `LensFilterProvider` encloses the whole layout because the chips in the
 * strip and the explorer in the canvas are siblings that share one filter.
 * The provider remounts with the layout, so the filter resets whenever the
 * route changes.
 *
 * Renders no element of its own — `LensLayout` owns the root — so its only
 * prop is the routed page.
 *
 * `import { DefinitionsLayout } from "#domains/lenses/definitions";`
 */
export default function DefinitionsLayout({
  children,
}: WrapperComponentProps<ReactNode>): ReactElement {
  return (
    <LensFilterProvider>
      <LensLayout
        footer={<SiteColophon />}
        rail={<SiteRail />}
        strip={
          <ModeStrip
            context={<Context />}
            controls={<Controls />}
            status={<Status />}
          />
        }
      >
        {children}
      </LensLayout>
    </LensFilterProvider>
  );
}
