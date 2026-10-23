/**
 * A compact address's prefix name: a letter or underscore, then letters,
 * digits, underscores, dots and hyphens, as a namespace inventory names it.
 */
export const PREFIX_NAME = /^[A-Za-z_][\w.-]*$/;

/** An IRI up to and through its last `#`, `/` or `:`, which its local name follows. */
export const THROUGH_LAST_SEPARATOR = /^.*[#/:]/;
