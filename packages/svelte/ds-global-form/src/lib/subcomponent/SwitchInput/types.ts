import type { HTMLInputAttributes } from "svelte/elements";

/**
 * Props for the presentational Switch input. `type` and `role` are fixed by the
 * component (`checkbox` / `switch`).
 */
export type SwitchInputProps = Omit<HTMLInputAttributes, "type" | "role"> & {
  /** Whether the switch is on. Bindable. */
  checked?: boolean;
};
