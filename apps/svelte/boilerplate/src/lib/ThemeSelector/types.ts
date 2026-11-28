import type { SvelteHTMLElements } from "svelte/elements";
import type { THEMES } from "./constants.js";

/** A theme that pins a colour scheme. */
export type Theme = (typeof THEMES)[number];

/** The theme preference: a pinned theme, or `system` to follow the reader's OS. */
export type ThemePreference = Theme | "system";

/**
 * Props for `ThemeSelector`: the preference the page was rendered with, plus
 * the native props of the root `<form>`.
 */
export interface ThemeSelectorProps
  extends Omit<SvelteHTMLElements["form"], "children" | "method" | "action"> {
  /** The preference the server read from the theme cookie. */
  preference: ThemePreference;
}
