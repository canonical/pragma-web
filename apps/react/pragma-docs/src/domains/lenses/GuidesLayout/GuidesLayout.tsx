import { SkipLink } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { CANVAS_ELEMENT_ID, Canvas } from "#lib/Canvas";
import { ModeStrip } from "#lib/ModeStrip";
import { SiteColophon } from "#lib/SiteColophon";
import { SiteRail } from "#lib/SiteRail";
import type { GuidesLayoutProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds guides-layout";

/**
 * The Guides lens's page layout: the site rail and colophon around the
 * guides index and a guide's reading page, with an empty strip.
 *
 * Its root is the layout's own page grid: the rail in the west columns,
 * then a viewport stacking the strip, the canvas and the colophon.
 *
 * `import { GuidesLayout } from "./GuidesLayout/index.js";`
 */
export default function GuidesLayout({
  children,
  className,
  ...props
}: GuidesLayoutProps): ReactElement {
  return (
    <div
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <SkipLink mainId={CANVAS_ELEMENT_ID}>Skip to content</SkipLink>
      <SiteRail />
      <div className="viewport">
        <ModeStrip />
        <Canvas>{children}</Canvas>
        <SiteColophon />
      </div>
    </div>
  );
}
