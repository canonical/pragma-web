/** The cookie the theme preference is stored in, on the server and in the browser. */
export const THEME_COOKIE = "theme";

/** The theme cookie's lifetime, in seconds (one year). */
export const THEME_COOKIE_MAX_AGE = 31_536_000;

/** The themes that pin a colour scheme; anything else follows the system. */
export const THEMES = ["light", "dark"] as const;
