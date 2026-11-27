import type { ComponentProps, RefObject } from "react";
import type { AnnouncerHandle } from "../../../../../../../common/index.js";
import type { ContextOptions } from "../../../../../types.js";
import type { QueryGroupStandIn } from "../../types.js";

/** Sheet's own props. */
type OwnProps = {
  /** The dialog's id, which the summary button names. */
  readonly id: string;
  /** The query group the sheet reads and commits to. */
  readonly group: QueryGroupStandIn;
  /** Whether the location spells addresses, which the baseline needs. */
  readonly hasHref: boolean;
  /** Whether the dialog is open, so its body renders once scripts run. */
  readonly isOpen: boolean;
  /** Called as the dialog opens before scripts ran, or closes. */
  readonly onOpenChange: (isOpen: boolean) => void;
  /** The ref the sheet's own status region takes while it is open. */
  readonly regionRef: RefObject<AnnouncerHandle | null>;
  /** The bar's announcer, which speaks through that region while there. */
  readonly announce: ContextOptions["announce"];
};

/**
 * Props of the bar's narrow form, its sheet. The rest reach its native
 * `dialog`, apart from `children`, which it renders itself, and `open`,
 * which its invokers and the platform own.
 */
export type SheetProps = OwnProps &
  Omit<ComponentProps<"dialog">, keyof OwnProps | "children" | "open">;
