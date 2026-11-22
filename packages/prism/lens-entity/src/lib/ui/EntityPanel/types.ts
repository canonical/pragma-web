import type { ComponentProps, ReactNode } from "react";

type OwnProps = {
  /** The entity's absolute IRI. */
  readonly uri: string;
  /**
   * The level of the entity's name: 2 in a workspace's inspector, 3 where
   * the panel sits under a heading of its own; the Referenced by heading
   * sits one level below it.
   */
  readonly headingLevel?: 2 | 3;
  /**
   * The entity's own page, the one that marks it canonical, which Open
   * targets: given by a host whose site's home for the entity is not that
   * page (a workspace's selection route), else the site's home.
   */
  readonly home?: string;
  /**
   * What the panel says when nothing answers to `uri`, in place of its own
   * not-found status: a host that knows more about the address it was
   * asked for words it.
   */
  readonly notFound?: ReactNode;
};

/**
 * Props accepted by `EntityPanel`: the entity and the native props of its
 * root `<section>`. The native `children` are excluded: the panel renders
 * the entity.
 */
export type EntityPanelProps = OwnProps &
  Omit<ComponentProps<"section">, keyof OwnProps | "children">;
