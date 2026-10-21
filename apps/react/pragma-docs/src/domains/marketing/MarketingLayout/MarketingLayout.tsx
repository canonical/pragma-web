import { SkipLink } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { CANVAS_ELEMENT_ID, Canvas } from "#lib/Canvas";
import { makeLensContext } from "#lib/LensBreadcrumbs";
import { ModeStrip } from "#lib/ModeStrip";
import { SiteColophon } from "#lib/SiteColophon";
import { SiteRail } from "#lib/SiteRail";
import type { MarketingLayoutProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds marketing-layout";

/**
 * The strip's breadcrumb trail: a single `Home` crumb. The lobby has one
 * address, so the lens crumb is the current page.
 */
const HomeContext = makeLensContext({
  lensLabel: "Home",
  lensRouteName: "home",
});

/**
 * The Home lens's page layout: the site rail and colophon around the lobby,
 * with the strip carrying its single `Home` crumb.
 *
 * Its root is the layout's own page grid: the rail in the west columns,
 * then a viewport stacking the strip, the canvas and the colophon.
 *
 * `import { MarketingLayout } from "./MarketingLayout/index.js";`
 */
export default function MarketingLayout({
  children,
  className,
  ...props
}: MarketingLayoutProps): ReactElement {
  return (
    <div
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <SkipLink mainId={CANVAS_ELEMENT_ID}>Skip to content</SkipLink>
      <SiteRail />
      <div className="viewport">
        <ModeStrip context={<HomeContext />} />
        <Canvas>{children}</Canvas>
        <SiteColophon />
      </div>
    </div>
  );
}
