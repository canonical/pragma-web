// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";

type OwnProps = {
  /** The text the box holds. */
  readonly label?: string;
};

/** Props accepted by `UIProbe`: its `<div>` root's own. */
export type UIProbeProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
