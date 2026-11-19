import {
  type ComputePositionConfig,
  flip,
  offset,
  type Placement,
} from "@floating-ui/dom";
import { useFloatingUI } from "../../../hooks/index.js";
import { DEFAULT_PLACEMENTS } from "./constants.js";

/**
 * Compute reactive tooltip positioning using Floating UI, with optional automatic fitting into the viewport.
 *
 * @param getActive - Getter indicating if the tooltip should currently be positioned.
 * @param getPreferredDirections - Getter returning the preferred logical directions.
 * @param getAutoFit - Getter determining whether the tooltip should automatically fit into the viewport, after it exhausted the preffered directions.
 * @param getDistanceToTrigger - Getter returning pixel offset distance between trigger element and tooltip.
 * @returns
 *  - triggerAttachment - Attachment to be applied to the tooltip trigger element.
 *  - targetAttachment - Attachment to be applied to the tooltip target element.
 *  - tooltipPosition - Reactive style object containing the current position of the tooltip.
 *  - getTooltipPlacement - Getter for the current placement of the tooltip (after any auto-adjustment).
 */
export function useTooltipPosition(
  getActive: () => boolean,
  getPreferredDirections: () => readonly Placement[],
  getAutoFit: () => boolean,
  getDistanceToTrigger: () => number,
) {
  const tooltipPosition = $state({ top: "auto", left: "auto" });

  let tooltipPlacement = $derived.by<Placement>(() => {
    const first = getPreferredDirections().at(0);
    if (!first) throw new Error("Preferred directions must not be empty.");

    return first;
  });

  const floatingUiConfig = $derived.by<Partial<ComputePositionConfig>>(() => {
    const [placement, ...userFallbacks] = getPreferredDirections();

    return {
      placement,
      middleware: [
        offset(getDistanceToTrigger()),
        flip({
          fallbackPlacements: getAutoFit()
            ? [...userFallbacks, ...DEFAULT_PLACEMENTS]
            : userFallbacks,
        }),
      ],
    };
  });
  const { triggerAttachment, targetAttachment } = useFloatingUI(
    getActive,
    () => floatingUiConfig,
    ({ x, y, placement }) => {
      tooltipPosition.top = `${y}px`;
      tooltipPosition.left = `${x}px`;
      tooltipPlacement = placement;
    },
  );

  return {
    triggerAttachment,
    targetAttachment,
    tooltipPosition,
    getTooltipPlacement: () => tooltipPlacement,
  };
}
