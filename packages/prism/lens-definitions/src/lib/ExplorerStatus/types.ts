import type { ComponentProps } from "react";

type OwnProps = {
  /** How many classes the graph currently shows. */
  readonly visible: number;
  /** How many classes exist in total, across every ontology. */
  readonly total: number;
  /** How many of the visible classes are abstract. */
  readonly abstract: number;
};

/**
 * Props accepted by `ExplorerStatus`: the counts it states, and the native
 * props of its root `<figure>`.
 */
export type ExplorerStatusProps = OwnProps &
  Omit<ComponentProps<"figure">, keyof OwnProps>;
