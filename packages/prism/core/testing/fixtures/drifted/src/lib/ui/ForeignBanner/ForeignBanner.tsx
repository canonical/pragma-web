// Scaffolded by @canonical/summon-component:svelte v0.43.0

import type { ReactElement } from "react";
import type { ForeignBannerProps } from "./types.js";

const componentCssClassName = "ds foreign-banner";

/** A fixture component whose banner names another generator. */
export default function ForeignBanner({
  className,
  ...props
}: ForeignBannerProps): ReactElement {
  return (
    <div
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    />
  );
}
