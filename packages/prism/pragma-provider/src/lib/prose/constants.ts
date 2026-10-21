/**
 * The prose domain's fixed values: the language a sidecar is written in when
 * its name says nothing, what reads as a language, the header a request
 * names its language in, and what counts as a reference destination.
 */

/**
 * The language of a sidecar whose name carries no language segment
 * (`button.md`), and the language served when the one asked for is not
 * authored. Every entity with prose has text in it.
 */
export const DEFAULT_PROSE_LANG = "en";

/**
 * A language tag as this provider reads one: a two- or three-letter
 * lowercase primary language, then any number of hyphenated subtags of two
 * to eight letters or digits (`fr`, `pt-BR`, `zh-Hant`). Narrower than
 * BCP 47 on purpose; a segment it does not match is part of a name, not a
 * language.
 */
export const LANGUAGE_TAG = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;

/**
 * The request header that names the language prose is served in when a
 * query does not ask for one. Not `Accept-Language`: a browser sends that on
 * its own, so a client-side fetch and a server-side render of the same page
 * would see different languages. Whoever builds the request sets this one
 * deliberately, from the locale the page is rendered in.
 */
export const LOCALE_HEADER = "x-prism-locale";

/**
 * A link destination that can name an entity: an IRI scheme, a colon, and a
 * non-empty remainder holding no whitespace and none of the characters an
 * IRI reference may not carry (`<`, `>`, `"`, `{`, `}`, `|`, `\`, `^`,
 * backtick). A relative path (`./guide.md`) or a fragment (`#usage`) has no
 * scheme and is not a reference; an absolute IRI outside the graph is one,
 * and the graph decides whether it resolves.
 */
export const REFERENCE_IRI = /^[A-Za-z][A-Za-z0-9+.-]*:[^\s<>"{}|\\^`]+$/;
