/**
 * The prose domain's fixed values: what counts as a reference destination.
 */

/**
 * A link destination that can name an entity: an IRI scheme, a colon, and a
 * non-empty remainder holding no whitespace and none of the characters an
 * IRI reference may not carry (`<`, `>`, `"`, `{`, `}`, `|`, `\`, `^`,
 * backtick). A relative path (`./guide.md`) or a fragment (`#usage`) has no
 * scheme and is not a reference; an absolute IRI outside the graph is one,
 * and the graph decides whether it resolves.
 */
export const REFERENCE_IRI = /^[A-Za-z][A-Za-z0-9+.-]*:[^\s<>"{}|\\^`]+$/;
