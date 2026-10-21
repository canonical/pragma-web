import type { ReactElement } from "react";
import { Canvas } from "#lib/Canvas";
import { CanvasSkipLink } from "#lib/CanvasSkipLink";
import { ModeStrip } from "#lib/ModeStrip";
import { SiteColophon } from "#lib/SiteColophon";
import { SiteRail } from "#lib/SiteRail";
import { JourneyViewProvider } from "../journeyViewContext.js";
import { journeysStripSlots } from "../stripSlots.js";
import type { JourneysLayoutProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds journeys-layout";

const { Context, Controls } = journeysStripSlots;

/**
 * The Journeys lens's page layout: the site rail and colophon around the
 * journeys explorer, with the strip carrying the breadcrumb trail and the
 * Table ⇄ Graph view switch.
 *
 * `JourneyViewProvider` encloses the whole layout because the switch in the
 * strip and the explorer in the canvas are siblings that share one view.
 * The provider lives as long as the layout, which the router remounts
 * whenever the matched route changes: the view survives a move from one
 * job to another (the same route, new params) and resets on a move to the
 * lens index or to another lens.
 *
 * Its root is the layout's own page grid: the rail in the west columns,
 * then a viewport stacking the strip, the canvas and the colophon.
 *
 * `import { JourneysLayout } from "./JourneysLayout/index.js";`
 */
export default function JourneysLayout({
  children,
  className,
  ...props
}: JourneysLayoutProps): ReactElement {
  return (
    <JourneyViewProvider>
      <div
        {...props}
        className={[componentCssClassName, className].filter(Boolean).join(" ")}
      >
        <CanvasSkipLink />
        <SiteRail />
        <div className="viewport">
          <ModeStrip context={<Context />} controls={<Controls />} />
          <Canvas>{children}</Canvas>
          <SiteColophon />
        </div>
      </div>
    </JourneyViewProvider>
  );
}
