import type { TermInspector_class$data } from "../../../../__generated__/TermInspector_class.graphql.js";

/** Props accepted by `InstanceItem`. */
export interface InstanceItemProps {
  /** The instance, as the inspector's fragment selects it. */
  readonly node: TermInspector_class$data["instances"]["edges"][number]["node"];
}
