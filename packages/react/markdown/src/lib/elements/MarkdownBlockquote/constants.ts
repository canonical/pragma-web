import type { AnnouncementProps } from "@canonical/react-ds-global";
import type { AdmonitionKind } from "../../admonitions/index.js";

/**
 * How each admonition kind is presented: the criticality of the announcement
 * it renders as, and the heading it carries.
 *
 * The labels are English defaults. To translate them, or to present
 * admonitions differently, override `blockquote` in the components map.
 */
export const ADMONITION_PRESENTATION: Readonly<
  Record<
    AdmonitionKind,
    {
      readonly criticality: AnnouncementProps["criticality"];
      readonly label: string;
    }
  >
> = {
  note: { criticality: "information", label: "Note" },
  tip: { criticality: "success", label: "Tip" },
  important: { criticality: "information", label: "Important" },
  warning: { criticality: "warning", label: "Warning" },
  caution: { criticality: "error", label: "Caution" },
};
