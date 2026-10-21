import type { ReactElement } from "react";
import { CANVAS_ELEMENT_ID } from "#lib/Canvas";
import type { CanvasSkipLinkProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds canvas-skip-link";

/**
 * The link a lens layout renders first, so a keyboard reader can skip the
 * rail and the strip and land on the canvas. It stays off-screen until it
 * is focused, then floats above the chrome.
 *
 * `import { CanvasSkipLink } from "#lib/CanvasSkipLink";`
 */
export default function CanvasSkipLink({
  className,
  ...props
}: CanvasSkipLinkProps): ReactElement {
  return (
    <a
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      href={`#${CANVAS_ELEMENT_ID}`}
    >
      Skip to content
    </a>
  );
}
