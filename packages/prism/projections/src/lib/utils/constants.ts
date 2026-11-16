/**
 * A compact address's prefix name: a letter or underscore, then letters,
 * digits, underscores, dots and hyphens, as a namespace inventory names it.
 */
export const PREFIX_NAME = /^[A-Za-z_][\w.-]*$/;

/**
 * An IRI up to and through its last `#`, `/` or `:`, which its local name
 * follows.
 */
export const THROUGH_LAST_SEPARATOR = /^.*[#/:]/;

/**
 * The colour values a mark or swatch accepts from a graph: a hex colour
 * (3, 4, 6 or 8 digits), or one colour function whose arguments hold only
 * digits, percent signs, dots, commas, slashes and spaces, so no `;`,
 * nested function, `url(`, `var(` or keyword can reach an inline style.
 */
export const PLAIN_COLOUR =
  /^(?:#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})|(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\([\d%., /]+\))$/i;
