import { Canvas, CanvasSkipLink, ModeStrip } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { Trail } from "./common/Trail/index.js";
import type { StandardsLayoutProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds standards-layout";

/**
 * The Standards lens's page layout: the site's rail and colophon around the
 * index and reading pages, with the strip carrying the breadcrumb trail. The
 * strip's controls and status stay empty: the lens has no filter and no
 * figure to put there.
 *
 * Its root is the layout's own page grid: the rail in the west columns,
 * then a viewport stacking the strip, the canvas and the colophon. The rail
 * and the colophon are the site's own, so a site binds them once, in the
 * wrapper it groups the lens's routes under.
 *
 * `import { StandardsLayout } from "@canonical/prism-lens-standards";`
 */
export default function StandardsLayout({
  children,
  className,
  colophon,
  rail,
  ...props
}: StandardsLayoutProps): ReactElement {
  return (
    <div
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <CanvasSkipLink />
      {rail}
      <div className="viewport">
        <ModeStrip context={<Trail />} />
        <Canvas>{children}</Canvas>
        {colophon}
      </div>
    </div>
  );
}
