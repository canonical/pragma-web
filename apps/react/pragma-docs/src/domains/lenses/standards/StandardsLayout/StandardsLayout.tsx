import { SkipLink } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { CANVAS_ELEMENT_ID, Canvas } from "#lib/Canvas";
import { makeLensContext } from "#lib/LensBreadcrumbs";
import { ModeStrip } from "#lib/ModeStrip";
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
  lensLabel: "Standards",
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
      <SkipLink mainId={CANVAS_ELEMENT_ID}>Skip to content</SkipLink>
      <SiteRail />
      <div className="viewport">
        <ModeStrip context={<StandardsContext />} />
        <Canvas>{children}</Canvas>
        <SiteColophon />
      </div>
    </div>
  );
}
