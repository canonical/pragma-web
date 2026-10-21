/**
 * Fixed strings for the example provider. Data, not logic — excluded from
 * coverage per the repo's constants-file convention.
 */

/** Namespace IRI of the transit ontology. */
export const METRO_NAMESPACE = "https://metro.example/onto#";

/** Prefix bound to {@link METRO_NAMESPACE}. */
export const METRO_PREFIX = "metro";

/** Namespace IRI of the geography ontology. */
export const GEO_NAMESPACE = "https://geo.example/onto#";

/** Prefix bound to {@link GEO_NAMESPACE}. */
export const GEO_PREFIX = "geo";

/** Namespace IRI of RDF Schema, which supplies this TBox's metaclass. */
export const RDFS_NAMESPACE = "http://www.w3.org/2000/01/rdf-schema#";

/** Prefix bound to {@link RDFS_NAMESPACE}. */
export const RDFS_PREFIX = "rdfs";

/**
 * The class every OntologyClass is an instance of. `EntityMeta.type` is
 * non-null and OntologyClass implements Node, so classes need a class of
 * their own — and `rdfs:Class` is an instance of itself, so the TBox is
 * reflexive at the top rather than arbitrarily terminated.
 */
export const META_CLASS_URI = `${RDFS_NAMESPACE}Class`;

/** The class the embeddable coordinate pair is an instance of. */
export const GEO_POINT_CLASS_URI = `${GEO_NAMESPACE}GeoPoint`;

/** Language `EntityMeta`'s arguments default to, per the contract SDL. */
export const DEFAULT_LANG = "en";

/**
 * A language tag as this provider reads one: a two- or three-letter
 * lowercase primary language, then any number of hyphenated subtags of two
 * to eight letters or digits (`fr`, `pt-BR`, `zh-Hant`).
 */
export const LANGUAGE_TAG = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;

/**
 * The request header that names the language prose is served in when a
 * query does not ask for one. Not `Accept-Language`, which a browser sends
 * on its own: a client fetch and a server render of the same page would see
 * different languages.
 */
export const LOCALE_HEADER = "x-prism-locale";

/** Page size used when a connection query supplies neither `first` nor `last`. */
export const DEFAULT_PAGE_SIZE = 20;

/** The single path the demo server answers on. */
export const GRAPHQL_PATH = "/graphql";

/**
 * A link destination that can name an entity: an IRI scheme, a colon, and a
 * non-empty remainder holding no whitespace and none of the characters an
 * IRI reference may not carry (`<`, `>`, `"`, `{`, `}`, `|`, `\`, `^`,
 * backtick). A relative path (`./guide.md`) or a fragment (`#usage`) has no
 * scheme and is not a reference; an absolute IRI outside the graph is one,
 * and the graph decides whether it resolves.
 */
export const REFERENCE_IRI = /^[A-Za-z][A-Za-z0-9+.-]*:[^\s<>"{}|\\^`]+$/;
