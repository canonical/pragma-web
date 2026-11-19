import type {
  ComputePositionConfig,
  ComputePositionReturn,
} from "@floating-ui/dom";
import { autoUpdate, computePosition } from "@floating-ui/dom";
import type { Attachment } from "svelte/attachments";

/**
 * Helper around Floating UI to compute and update the position of a floating target relative to a trigger element.
 *
 * It wires up `autoUpdate`, calls `computePosition` on updates, and forwards the result to the provided callback.
 *
 * Usage:
 * - Attach `triggerAttachment` to the trigger element and `targetAttachment` to the target element you wish to position.
 * - Control activation via `getActive()` and supply options via `getOptions()`.
 *
 * @param getActive - Returns whether positioning should be active.
 * @param getOptions - Supplies options for `computePosition`. If `undefined`, defaults will be used.
 * @param callback - Invoked with the latest computed position.
 * @returns Attachments to be applied to the trigger and target elements.
 */
export function useFloatingUI(
  getActive: () => boolean,
  getOptions: () => Partial<ComputePositionConfig> | undefined,
  callback: (value: ComputePositionReturn) => void,
) {
  let triggerRef = $state<HTMLElement>();
  let targetRef = $state<HTMLElement>();

  const triggerAttachment: Attachment<HTMLElement> = (node) => {
    triggerRef = node;
    return () => (triggerRef = undefined);
  };

  const targetAttachment: Attachment<HTMLElement> = (node) => {
    targetRef = node;
    return () => (targetRef = undefined);
  };

  $effect(() => {
    if (!getActive()) return;
    if (!triggerRef || !targetRef) return;
    const options = getOptions();

    const cleanup = autoUpdate(triggerRef, targetRef, () => {
      if (!triggerRef || !targetRef) return;
      computePosition(triggerRef, targetRef, options)
        .then(callback)
        .catch(() => {
          // Swallow errors from computePosition to avoid unhandled promise rejections.
        });
    });

    return () => {
      cleanup();
    };
  });

  return {
    triggerAttachment,
    targetAttachment,
  };
}
