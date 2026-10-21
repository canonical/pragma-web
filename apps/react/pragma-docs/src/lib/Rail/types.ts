import type { ComponentProps } from "react";
import type { CollectedLens } from "#lib/routeLens";

/** The rail's brand link: the site's name, and the route it leads to. */
export interface RailBrand {
  /** The wordmark. */
  readonly label: string;
  /** The line under the wordmark, when the site has one. */
  readonly caption?: string;
  /** The name of the route the brand links to. */
  readonly to: string;
}

type OwnProps = {
  /** The lenses to list, in rail order (as `collectLenses` returns them). */
  readonly entries: readonly CollectedLens[];
  /** The brand link at the top of the rail. */
  readonly brand: RailBrand;
};

export type RailProps = OwnProps &
  Omit<ComponentProps<"nav">, keyof OwnProps | "children">;
