import type { ReactNode } from "react";
import type { EntityCardArm } from "../EntityCard/index.js";
import type { EntityChipArm } from "../EntityChip/index.js";
import type { EntityCommandArm } from "../EntityCommand/index.js";
import type { EntityRowArm } from "../EntityRow/index.js";
import type { EntityTitleArm } from "../EntityTitle/index.js";

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
  readonly chip: ProjectionMap<EntityChipArm>;
  /** The list row: a node as one entry of a list of results. */
  readonly row: ProjectionMap<EntityRowArm>;
  /** The card: a node as a self-contained tile in a grid of entities. */
  readonly card: ProjectionMap<EntityCardArm>;
  /** The command-palette entry: a node offered as a destination. */
  readonly command: ProjectionMap<EntityCommandArm>;
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
  /** The content whose representations read the maps. */
  readonly children: ReactNode;
}
