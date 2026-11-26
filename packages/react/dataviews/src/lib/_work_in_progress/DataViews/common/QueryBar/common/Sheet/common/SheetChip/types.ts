import type { QueryClause } from "../../../../types.js";

/** Props of one read-only chip in the sheet. */
export type SheetChipProps = {
  /** The clause the chip shows, as it applies. */
  readonly clause: QueryClause;
  /** Called with the clause by the chip's remove control. */
  readonly onRemove: (clause: QueryClause) => void;
  /** Before scripts run, where the remove control leads instead. */
  readonly removeHref?: string | null | undefined;
};
