import type { HTMLAttributes, HTMLImgAttributes } from "svelte/elements";

type ImageOnlyAttributes = Omit<
  HTMLImgAttributes,
  | keyof HTMLAttributes<HTMLElement>
  | "bind:naturalWidth"
  | "bind:naturalHeight"
  | "children"
  | "src"
>;

export interface AvatarProps
  extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  name?: string;
  /** The avatar image URL */
  src?: string;
  /** Avatar dimensions; defaults to small */
  size?: "small" | "large";
  /**
   * `<img>`-specific attributes (e.g. `alt`, `loading`, `fetchpriority`) for the avatar image.
   * Only applied when the avatar renders as an image — i.e. `src` is set and the image has not failed to load
   */
  imageAttributes?: ImageOnlyAttributes;
}
