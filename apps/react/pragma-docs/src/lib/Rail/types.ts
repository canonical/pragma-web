import type { CollectedLens } from "@canonical/prism-core";
import type { ComponentProps } from "react";

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

/**
 * Props accepted by `Rail`: the lenses and the brand it lists, and the
 * native props of its `<nav>` root.
 *
 * The native `children` is excluded because the rail renders its own
 * content, the brand and one entry per lens.
 */
export type RailProps = OwnProps &
  Omit<ComponentProps<"nav">, keyof OwnProps | "children">;
