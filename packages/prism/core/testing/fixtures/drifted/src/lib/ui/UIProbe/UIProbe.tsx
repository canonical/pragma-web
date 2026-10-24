// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import type { UIProbeProps } from "./types.js";

const componentCssClassName = "ds uiprobe";

/**
 * A fixture component named with an acronym whose class name runs the
 * acronym into the next word.
 */
export default function UIProbe({
  className,
  ...props
}: UIProbeProps): ReactElement {
  return (
    <div
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    />
  );
}
