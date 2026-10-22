import type { ReactElement } from "react";
import { CANVAS_ELEMENT_ID } from "./constants.js";
import type { CanvasProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds canvas";

/**
 * The region a lens layout renders its routed page into: the page's one
 * `<main>`, and the one region that scrolls.
 *
 * It is a subgrid of whatever grid places it, so its columns run through to
 * the page it holds, and it is the skip link's target.
 *
 * `import { Canvas } from "@canonical/prism-core";`
 */
export default function Canvas({
  className,
  ...props
}: CanvasProps): ReactElement {
  return (
    <main
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-region="canvas"
      id={CANVAS_ELEMENT_ID}
      tabIndex={-1}
    />
  );
}
