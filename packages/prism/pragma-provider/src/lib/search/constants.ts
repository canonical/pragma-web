/**
 * The search domain's fixed values: the two queries the search index is
 * built from, one over the store and one over the compiled schema, and the
 * fields a search matches, in rank order.
 */

/**
 * Every IRI that is the subject of an `rdf:type` triple: the candidates for
 * the search index. Properties and ontologies are among them; `node(id:)`
 * resolves them to null, and the index drops them.
 */
export const TYPED_SUBJECTS_QUERY =
  "SELECT DISTINCT ?s WHERE { ?s a ?type FILTER(isIRI(?s)) }";

/**
 * What the index reads of one candidate, through the served schema itself,
 * so an entry holds exactly what `_meta` serves: its title and definition in
 * the default language, and its CURIE; and its type, which the entry is
 * counted under, with that class's visibility, since an instance of a hidden
 * class is a value and never a search result.
 */
export const SEARCH_ENTRY_QUERY =
  "query SearchEntry($id: ID!) { node(id: $id) { uri _meta { curie title definition type { uri visibility } } } }";

/**
 * The fields of a search entry that text search reads, best first. A
 * match's tier is its field's place in this list: a title match (tier 0)
 * ranks before a CURIE match (tier 1), and a CURIE match before a
 * definition match (tier 2), so reordering the list reorders every result.
 */
export const SEARCH_FIELDS = ["title", "curie", "definition"] as const;

/**
 * The field each search tier reports a match in, in `SEARCH_FIELDS` order:
 * the title's predicate, `uri` for the CURIE, and the definition's predicate.
 */
export const SEARCH_MATCH_FIELDS = [
  "rdfs:label",
  "uri",
  "skos:definition",
] as const;

/** The longest passage a search match reports, in UTF-16 code units. */
export const SEARCH_PASSAGE_LENGTH = 160;
