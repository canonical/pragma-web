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
 * What the index reads of one candidate, through the compiled schema
 * itself, so an entry holds exactly what `_meta` serves: its title and
 * definition in the default language, and its CURIE.
 */
export const SEARCH_ENTRY_QUERY =
  "query SearchEntry($id: ID!) { node(id: $id) { uri _meta { curie title definition } } }";

/**
 * The fields of a search entry that text search reads, best first. A
 * match's tier is its field's place in this list: a title match (tier 0)
 * ranks before a CURIE match (tier 1), and a CURIE match before a
 * definition match (tier 2), so reordering the list reorders every result.
 */
export const SEARCH_FIELDS = ["title", "curie", "definition"] as const;
