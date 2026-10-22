import type { LinkComponent } from "@canonical/react-ds-global";
import type { ReactNode } from "react";
import type { CardArm } from "../CardProjection/index.js";
import type { ChipArm } from "../ChipProjection/index.js";
import type { CommandArm } from "../CommandProjection/index.js";
import type { EntityTitleArm } from "../EntityTitle/index.js";
import type { RowArm } from "../RowProjection/index.js";

/**
 * One representation's arms, keyed by the `__typename` each renders. `Node`
 * is required: it is the arm for every type the map does not name.
 */
export type ProjectionMap<TArm> = { readonly Node: TArm } & {
  readonly [typename: string]: TArm | undefined;
};

/** The arms of every representation, one map each. */
export interface ProjectionMaps {
  /** The inline mention: a node named in running text. */
  readonly chip: ProjectionMap<ChipArm>;
  /** The list row: a node as one entry of a list of results. */
  readonly row: ProjectionMap<RowArm>;
  /** The card: a node as a self-contained tile in a grid of entities. */
  readonly card: ProjectionMap<CardArm>;
  /** The command-palette entry: a node offered as a destination. */
  readonly command: ProjectionMap<CommandArm>;
  /** The page title: the heading of the page a node owns. */
  readonly title: ProjectionMap<EntityTitleArm>;
}

/** Props accepted by `ProjectionsProvider`. */
export interface ProjectionsProviderProps {
  /**
   * The site's maps: `defaultProjectionMaps`. An arm reads only what its
   * representation's composite selects, and only the package writes the
   * composites.
   */
  readonly maps: ProjectionMaps;
  /**
   * The link every representation renders a node's home through: the
   * site's router link adapter, so following a mention navigates on the
   * client. Defaults to the intrinsic `"a"`, a full document load.
   */
  readonly LinkComponent?: LinkComponent;
  /** The content whose representations read the maps. */
  readonly children: ReactNode;
}

/** What a `ProjectionsProvider` holds for the representations below it. */
export interface ProjectionsContextValue {
  /** The site's maps, one per representation. */
  readonly maps: ProjectionMaps;
  /** The link a node's home renders through. */
  readonly LinkComponent: LinkComponent;
}
