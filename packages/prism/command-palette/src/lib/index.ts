/**
 * The command palette of a Prism documentation site: a modal the reader
 * opens with Cmd+K or Ctrl+K from anywhere on the site, which searches the
 * graph by text through the provider's search extension and opens the
 * canonical home of the result the reader chooses, or, with the site's
 * `searchHref`, hands the text to the site's search page. Without
 * `searchHref` it reads "Jump to" and narrows the site's `destinations`.
 * A site mounts it once, inside its shell.
 *
 * @module
 */

export type {
  PaletteDestination,
  PaletteDestinations,
} from "./ui/CommandPaletteJump/index.js";
export type { CommandPaletteProps } from "./ui/index.js";
export { CommandPalette } from "./ui/index.js";
