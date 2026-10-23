import type { FleetNodeKind } from "../../../../types.js";

/** Props accepted by `FactList`, which renders no props of its own beyond these. */
export interface FactListProps {
  /** The kind of node the page shows, which picks the page's operation. */
  readonly kind: FleetNodeKind;
  /** The node's address, as the page's route gives it. */
  readonly address: string;
}
