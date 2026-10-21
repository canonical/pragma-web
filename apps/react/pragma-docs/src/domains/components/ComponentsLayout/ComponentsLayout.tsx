import {
  Canvas,
  CanvasSkipLink,
  ModeStrip,
  makeLensContext,
} from "@canonical/prism-core";
import type { ReactElement } from "react";
import { SiteColophon } from "#lib/SiteColophon";
import { SiteRail } from "#lib/SiteRail";
import type { ComponentsLayoutProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds components-layout";

/**
 * The strip's breadcrumb trail: `Components` on the catalog,
 * `Components / <uri>` on an entity page. The entity crumb is the `:uri`
 * route param (the prefixed URI), so the trail reads no query.
 */
const ComponentsContext = makeLensContext({
  lensLabel: "Components",
  lensRouteName: "components",
  paramKey: "uri",
});

/**
 * The Components lens's page layout: the site rail and colophon around the
 * catalog and entity pages, with the strip carrying the breadcrumb trail.
 *
 * Its root is the layout's own page grid: the rail in the west columns,
 * then a viewport stacking the strip, the canvas and the colophon.
 *
 * `import { ComponentsLayout } from "./ComponentsLayout/index.js";`
 */
export default function ComponentsLayout({
  children,
  className,
  ...props
}: ComponentsLayoutProps): ReactElement {
  return (
    <div
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <CanvasSkipLink />
      <SiteRail />
      <div className="viewport">
        <ModeStrip context={<ComponentsContext />} />
        <Canvas>{children}</Canvas>
        <SiteColophon />
      </div>
    </div>
  );
}
