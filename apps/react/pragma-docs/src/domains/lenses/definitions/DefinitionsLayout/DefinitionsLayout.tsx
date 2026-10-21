import { Canvas, CanvasSkipLink, ModeStrip } from "@canonical/prism-core";
import type { ReactElement } from "react";
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
 * The provider lives as long as the layout, which the router remounts
 * whenever the matched route changes: the filter survives a move from one
 * term to another (the same route, new params) and resets on a move to the
 * lens index or to another lens.
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
        <CanvasSkipLink />
        <SiteRail />
        <div className="viewport">
          <ModeStrip
            context={<Context lensLabel="Definitions" />}
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
