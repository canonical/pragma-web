import type { QueryGroupStandIn, QueryRefusedClause } from "../../types.js";

/** Props of a refused filter or search's chip. */
export type RefusedChipProps = {
  /** The parameter the link carried, and why it was refused. */
  readonly clause: QueryRefusedClause;
  /** The query group the chip reads its refusal from. */
  readonly group: QueryGroupStandIn;
  /** Called with the clause by the clear control. */
  readonly onClear: (clause: QueryRefusedClause) => void;
};
