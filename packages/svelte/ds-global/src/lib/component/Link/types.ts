import type { HTMLAnchorAttributes } from "svelte/elements";

type BaseProps = HTMLAnchorAttributes;

/**
 * Props for the Link component
 */
export interface LinkProps extends BaseProps {
  /** Link appearance modifier */
  appearance?: "soft";
}
