import {
  Canvas,
  CanvasSkipLink,
  ModeStrip,
  makeLensContext,
} from "@canonical/prism-core";
import type { ReactElement } from "react";
import { SiteColophon } from "#lib/SiteColophon";
import { SiteRail } from "#lib/SiteRail";
import type { StandardsLayoutProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds standards-layout";

/**
 * The strip's breadcrumb trail: `Standards` on the index, `Standards / <uri>`
 * on a reading page. The reading crumb is the `:uri` route param (the
 * entity's absolute IRI), so the trail reads no query.
 */
const StandardsContext = makeLensContext({
  lensRouteName: "standards",
  paramKey: "uri",
});

/**
 * The Standards lens's page layout: the site rail and colophon around the
 * index and reading pages, with the strip carrying the breadcrumb trail.
 *
 * Its root is the layout's own page grid: the rail in the west columns,
 * then a viewport stacking the strip, the canvas and the colophon.
 *
 * `import { StandardsLayout } from "./StandardsLayout/index.js";`
 */
export default function StandardsLayout({
  children,
  className,
  ...props
}: StandardsLayoutProps): ReactElement {
  return (
    <div
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <CanvasSkipLink />
      <SiteRail />
      <div className="viewport">
        <ModeStrip context={<StandardsContext lensLabel="Standards" />} />
        <Canvas>{children}</Canvas>
        <SiteColophon />
      </div>
    </div>
  );
}
