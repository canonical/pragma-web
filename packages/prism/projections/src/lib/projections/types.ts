import type { ReactNode } from "react";
import type { EntityChipArm } from "../EntityChip/index.js";

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
}

/** Props accepted by `ProjectionsProvider`. */
export interface ProjectionsProviderProps {
  /** The site's maps: `defaultProjectionMaps`, or a spread over it. */
  readonly maps: ProjectionMaps;
  /** The content whose representations read the maps. */
  readonly children: ReactNode;
}
