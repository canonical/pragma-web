// Scaffolded by @canonical/summon-component:svelte v0.43.0

import type { ComponentProps } from "react";

type OwnProps = {
  /** The text the box holds. */
  readonly label?: string;
};

/** Props accepted by `ForeignBanner`: its `<div>` root's own. */
export type ForeignBannerProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
