import type { HTMLAttributes } from "svelte/elements";

export type HexFormat = "hex6" | "hex3" | "hex8";

/**
 * Props for the presentational Color input. Other attributes are spread onto
 * the swatch trigger, or onto the root when there are no swatches.
 */
export type ColorInputProps = Omit<HTMLAttributes<HTMLElement>, "value"> & {
  /** The colour as a hex string. Bindable. */
  value?: string;
  /** Whether the input is disabled. */
  disabled?: boolean;
  /** Predefined colour swatches to display. */
  swatches?: readonly string[];
  /** Show the hex text input. Default: true. */
  showHexInput?: boolean;
  /** Show the current colour preview swatch. Default: true. */
  showCurrentColor?: boolean;
  /** Accepted hex formats. Default: ["hex6"]. */
  hexFormats?: readonly HexFormat[];
  /** Name of the control, used by the field. */
  name?: string;
  /** Native required state, forwarded by the field. */
  required?: boolean;
};
