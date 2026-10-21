import { SkipLink } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { CANVAS_ELEMENT_ID, Canvas } from "#lib/Canvas";
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
 * The provider remounts with the layout, so the view resets whenever the
 * route changes.
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
        <SkipLink mainId={CANVAS_ELEMENT_ID}>Skip to content</SkipLink>
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
