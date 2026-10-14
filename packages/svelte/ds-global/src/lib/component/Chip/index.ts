import { default as ChipRoot } from "./Chip.svelte";
import { Dismiss } from "./common/index.js";

const Chip = ChipRoot as typeof ChipRoot & {
  /**
   * Dismissal control with native button attributes and events.
   * Use inside `Chip`; each chip supports one dismissal control and
   * renders as a span rather than a button.
   *
   * Defaults to `type="button"`; override the native `type` prop to
   * submit or reset a form. The accessible name defaults to
   * `Dismiss {lead}: {value}`, or `Dismiss {value}` without a lead.
   * Override `aria-label` to customize it, or provide children to
   * replace the default icon.
   *
   * @example
   * ```svelte
   * <script lang="ts">
   *   import { Chip } from "@canonical/svelte-ds-global";
   * </script>
   *
   * <Chip lead="Owner" value="Bob">
   *   <Chip.Dismiss
   *     onclick={() => removeOwner("Bob")}
   *     disabled={saving}
   *     aria-label="Remove Bob"
   *   />
   * </Chip>
   * ```
   */
  Dismiss: typeof Dismiss;
};
Chip.Dismiss = Dismiss;

export type { ChipDismissProps } from "./common/index.js";
export type { ChipProps } from "./types.js";
export { Chip };
