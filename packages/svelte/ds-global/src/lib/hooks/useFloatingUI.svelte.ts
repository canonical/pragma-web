import type {
  ComputePositionConfig,
  ComputePositionReturn,
} from "@floating-ui/dom";
import { autoUpdate, computePosition } from "@floating-ui/dom";

/**
 * Helper around Floating UI to compute and update the position of a floating target relative to a trigger element.
 *
 * It wires up `autoUpdate`, calls `computePosition` on updates, and forwards the result to the provided callback.
 *
 * Control activation via `getActive()`, provide the trigger and target elements
 * through getters, and supply options via `getOptions()`.
 *
 * @param getActive - Returns whether positioning should be active.
 * @param getTrigger - Returns the element to position relative to.
 * @param getTarget - Returns the floating element to position.
 * @param getOptions - Supplies options for `computePosition`. If `undefined`, defaults will be used.
 * @param callback - Invoked with the latest computed position.
 */
export function useFloatingUI(
  getActive: () => boolean,
  getTrigger: () => HTMLElement | undefined,
  getTarget: () => HTMLElement | undefined,
  getOptions: () => Partial<ComputePositionConfig> | undefined,
  callback: (value: ComputePositionReturn) => void,
) {
  $effect(() => {
    if (!getActive()) return;
    const trigger = getTrigger();
    const target = getTarget();
    if (!trigger || !target) return;
    const options = getOptions();

    const cleanup = autoUpdate(trigger, target, () => {
      computePosition(trigger, target, options)
        .then(callback)
        .catch(() => {
          // Swallow errors from computePosition to avoid unhandled promise rejections.
        });
    });

    return () => {
      cleanup();
    };
  });
}
