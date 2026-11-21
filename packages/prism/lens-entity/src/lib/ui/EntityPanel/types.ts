import type { ComponentProps } from "react";

type OwnProps = {
  /** The entity's absolute IRI. */
  readonly uri: string;
  /**
   * The level of the entity's name: 2 in a workspace's inspector, 3 where
   * the panel sits under a heading of its own; the Referenced by heading
   * sits one level below it.
   */
  readonly headingLevel?: 2 | 3;
};

/**
 * Props accepted by `EntityPanel`: the entity and the native props of its
 * root `<section>`. The native `children` are excluded: the panel renders
 * the entity.
 */
export type EntityPanelProps = OwnProps &
  Omit<ComponentProps<"section">, keyof OwnProps | "children">;
