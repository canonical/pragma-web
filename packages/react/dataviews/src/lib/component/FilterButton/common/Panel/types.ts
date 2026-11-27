import type { ComponentProps, ReactNode, Ref } from "react";
import type { FilterButtonPanelHandle } from "../../types.js";

/**
 * The panel's props. Exempt from the native-prop extension: a private part
 * that FilterButton alone renders, whose root takes only what FilterButton
 * hands it.
 */
export type PanelProps = {
  /** The popover's id, which the trigger's `popovertarget` names. */
  id: string;
  /** The trigger's id, which names the panel and takes focus back. */
  triggerId: string;
  /** The CSS anchor name the trigger carries, which places the panel. */
  anchorName: string;
  /** Records the open state, from each toggle and from the mounted popover. */
  onOpenChange: (isOpen: boolean) => void;
  /** The host's handle, from FilterButton's `panelRef`. */
  handleRef?: Ref<FilterButtonPanelHandle> | undefined;
  /** The host's listener for the panel's native toggle event. */
  onToggle?: ComponentProps<"div">["onToggle"] | undefined;
  /** The panel's content. */
  children: ReactNode;
};
