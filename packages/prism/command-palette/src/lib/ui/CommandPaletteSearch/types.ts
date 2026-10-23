// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";

type OwnProps = {
  /**
   * Called when the reader chooses a result, before the router navigates to
   * its home: the palette closes on it.
   */
  readonly onChoose: () => void;
};

/**
 * Props accepted by `CommandPaletteSearch`: its own, then the native props
 * of the `<div>` it renders as its root. `children` is excluded: the search
 * renders its field, its results and its preview.
 */
export type CommandPaletteSearchProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;

/** What `groupResultsByType` reads of a result: its type and the type's title. */
export interface GroupableNode {
  readonly __typename: string;
  readonly _meta: {
    readonly type: { readonly _meta: { readonly title: string } };
  };
}

/** One result in its group, with its place among every result. */
export interface GroupedResult<T extends GroupableNode> {
  /** The result. */
  readonly node: T;
  /** Its position in the grouped order, over every group. */
  readonly index: number;
}

/** The results of one type, in the order the search ranked them. */
export interface ResultGroup<T extends GroupableNode> {
  /** The type the group holds. */
  readonly typename: string;
  /** The type's title, the group's heading. */
  readonly title: string;
  /** The group's results, best first. */
  readonly results: readonly GroupedResult<T>[];
}
