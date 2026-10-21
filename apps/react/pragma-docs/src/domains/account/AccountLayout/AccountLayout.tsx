import type { ReactElement } from "react";
import { Canvas } from "#lib/Canvas";
import { CanvasSkipLink } from "#lib/CanvasSkipLink";
import { ModeStrip } from "#lib/ModeStrip";
import { SiteColophon } from "#lib/SiteColophon";
import { SiteRail } from "#lib/SiteRail";
import type { AccountLayoutProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds account-layout";

/**
 * The account pages' layout: the site rail and colophon around the sign-in
 * and account pages, with an empty strip.
 *
 * Its root is the layout's own page grid: the rail in the west columns,
 * then a viewport stacking the strip, the canvas and the colophon.
 *
 * `import { AccountLayout } from "./AccountLayout/index.js";`
 */
export default function AccountLayout({
  children,
  className,
  ...props
}: AccountLayoutProps): ReactElement {
  return (
    <div
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <CanvasSkipLink />
      <SiteRail />
      <div className="viewport">
        <ModeStrip />
        <Canvas>{children}</Canvas>
        <SiteColophon />
      </div>
    </div>
  );
}
