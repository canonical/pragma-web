// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";

type OwnProps = {
  /** The text the box holds. */
  readonly label: string;
  /** Where the link leads; without one the box holds no link. */
  readonly href?: string;
};

/** Props accepted by `ScaffoldedProbe`: its label, and its `<div>` root's own. */
export type ScaffoldedProbeProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
