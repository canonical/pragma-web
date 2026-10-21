import { SkipLink } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { CANVAS_ELEMENT_ID, Canvas } from "#lib/Canvas";
import { ModeStrip } from "#lib/ModeStrip";
import { SiteColophon } from "#lib/SiteColophon";
import { SiteRail } from "#lib/SiteRail";
import { LensFilterProvider } from "../lensFilterContext.js";
import { definitionsStripSlots } from "../stripSlots.js";
import type { DefinitionsLayoutProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds definitions-layout";

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
 * Its root is the layout's own page grid: the rail in the west columns,
 * then a viewport stacking the strip, the canvas and the colophon.
 *
 * `import { DefinitionsLayout } from "./DefinitionsLayout/index.js";`
 */
export default function DefinitionsLayout({
  children,
  className,
  ...props
}: DefinitionsLayoutProps): ReactElement {
  return (
    <LensFilterProvider>
      <div
        {...props}
        className={[componentCssClassName, className].filter(Boolean).join(" ")}
      >
        <SkipLink mainId={CANVAS_ELEMENT_ID}>Skip to content</SkipLink>
        <SiteRail />
        <div className="viewport">
          <ModeStrip
            context={<Context />}
            controls={<Controls />}
            status={<Status />}
          />
          <Canvas>{children}</Canvas>
          <SiteColophon />
        </div>
      </div>
    </LensFilterProvider>
  );
}
