import type { ComponentProps } from "react";
import type { FleetNodeKind } from "../../../../types.js";

type OwnProps = {
  /** The kind of node the page shows, which picks the page's operation. */
  readonly kind: FleetNodeKind;
  /** The node's address, as the page's route gives it. */
  readonly address: string;
};

/**
 * Props accepted by `FactList`: the node's kind and address, then the
 * native props of the `<section>` it renders around the facts. The native
 * `children` are excluded: the section lists the node's facts.
 */
export type FactListProps = OwnProps &
  Omit<ComponentProps<"section">, keyof OwnProps | "children">;
