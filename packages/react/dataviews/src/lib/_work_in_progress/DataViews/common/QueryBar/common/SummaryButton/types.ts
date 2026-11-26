import type { ComponentProps } from "react";
import type { QueryGroupStandIn } from "../../types.js";

/** SummaryButton's own props. */
type OwnProps = {
  /** The id of the sheet's dialog, which the button shows. */
  readonly sheetId: string;
  /** The query group whose applied filters it counts. */
  readonly group: QueryGroupStandIn;
  /** Called by a click once scripts run, before the sheet shows. */
  readonly onShow: () => void;
};

/**
 * Props of the narrow bar's summary button. The rest reach its native
 * `button`, apart from `children`, which it renders itself, and `type`.
 */
export type SummaryButtonProps = OwnProps &
  Omit<ComponentProps<"button">, keyof OwnProps | "children" | "type">;
