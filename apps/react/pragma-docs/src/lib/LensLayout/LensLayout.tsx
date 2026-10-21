import type { ReactElement } from "react";
import { CANVAS_ELEMENT_ID } from "./constants.js";
import type { LensLayoutProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds lens-layout";

/**
 * The page grid a lens layout renders into: the rail in the west columns,
 * then the viewport, which stacks the strip, the canvas and the footer.
 *
 * It owns the grid and the tokens every region reads, and nothing else: each
 * lens decides what goes in the rail, the strip and the footer, and the
 * routed page goes into the canvas. The canvas is the skip link's target and
 * the one region that scrolls.
 *
 * `import { LensLayout } from "#lib/LensLayout";`
 */
export default function LensLayout({
  rail,
  strip,
  footer,
  children,
  className,
  ...props
}: LensLayoutProps): ReactElement {
  return (
    <div
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <a className="skip" href={`#${CANVAS_ELEMENT_ID}`}>
        Skip to content
      </a>
      {rail}
      <div className="viewport">
        {strip}
        <main
          className="canvas"
          data-region="canvas"
          id={CANVAS_ELEMENT_ID}
          tabIndex={-1}
        >
          {children}
        </main>
        <footer className="footer" data-region="footer">
          {footer}
        </footer>
      </div>
    </div>
  );
}
