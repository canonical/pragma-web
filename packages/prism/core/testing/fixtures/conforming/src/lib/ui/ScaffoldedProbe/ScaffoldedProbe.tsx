// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import type { ScaffoldedProbeProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds scaffolded-probe";

/**
 * A fixture component: a box holding its label, and its link when it has
 * an `href`.
 */
export default function ScaffoldedProbe({
  className,
  label,
  href,
  ...props
}: ScaffoldedProbeProps): ReactElement {
  return (
    <div
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <span className="label">{label}</span>
      <span className="body">
        {href === undefined ? null : (
          <a className="link" href={href}>
            {label}
          </a>
        )}
      </span>
    </div>
  );
}
