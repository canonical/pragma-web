import type { EntityBinding } from "@canonical/prism-core";
import type { ComponentProps } from "react";

type OwnProps = {
  /** The binding whose class the entity must belong to. */
  readonly binding: EntityBinding;
  /** The lens's name, in the site's own words: the document title's tail. */
  readonly label: string;
  /** The entity's address, compact (`metro:northgate`) or absolute,
   * percent-decoded by the router. */
  readonly uri: string;
};

/**
 * Props accepted by `EntityPage`: the binding, the lens's label and the
 * entity's address, and the native props of its `<section>` root. The
 * native `children` are excluded: the page renders the entity itself.
 */
export type EntityPageProps = OwnProps &
  Omit<ComponentProps<"section">, keyof OwnProps | "children">;
