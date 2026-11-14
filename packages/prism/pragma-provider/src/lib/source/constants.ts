/**
 * The source extension's constants: the vocabularies every Turtle document
 * may name by prefix beside the compiled ontologies', the IRI written as
 * `a`, the datatype a plain string literal carries, and the shape of a
 * local name a prefixed name may end in.
 */

/** The well-known vocabularies, by the prefix a document writes them with. */
export const STANDARD_PREFIXES: ReadonlyMap<string, string> = new Map([
  ["dcterms", "http://purl.org/dc/terms/"],
  ["owl", "http://www.w3.org/2002/07/owl#"],
  ["rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#"],
  ["rdfs", "http://www.w3.org/2000/01/rdf-schema#"],
  ["skos", "http://www.w3.org/2004/02/skos/core#"],
  ["xsd", "http://www.w3.org/2001/XMLSchema#"],
]);

/**
 * How many blank nodes in a row a document follows below its entity: deep
 * enough for every nesting the corpus has, and a bound on a blank cycle.
 */
export const MAX_BLANK_DEPTH = 8;

/** `rdf:type`, which Turtle writes as `a` and lists first. */
export const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

/** `xsd:string`, the datatype a literal without a tag leaves unwritten. */
export const XSD_STRING = "http://www.w3.org/2001/XMLSchema#string";

/** `rdf:langString`, the datatype a language-tagged literal carries. */
export const RDF_LANG_STRING =
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";

/**
 * A local name a prefixed name may end in, conservatively: letters, digits,
 * underscores, hyphens and inner dots, never a leading hyphen or dot nor a
 * trailing dot. Any other local part is written as a full IRI.
 */
export const PN_LOCAL = /^[A-Za-z0-9_](?:[A-Za-z0-9_.-]*[A-Za-z0-9_-])?$/;

/** The characters a Turtle string escapes, and how. */
export const STRING_ESCAPES: ReadonlyMap<string, string> = new Map([
  ["\\", "\\\\"],
  ['"', '\\"'],
  ["\n", "\\n"],
  ["\r", "\\r"],
  ["\t", "\\t"],
]);
