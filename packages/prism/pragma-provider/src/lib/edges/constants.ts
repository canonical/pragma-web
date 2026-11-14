/**
 * The edges domain's fixed values: the queries class edges are weighed from.
 */

/** Every object property with a named domain and range: the declared edges. */
export const CLASS_EDGE_DECLARATIONS_QUERY = `PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT DISTINCT ?property ?domain ?range WHERE {
  ?property a owl:ObjectProperty ; rdfs:domain ?domain ; rdfs:range ?range .
  FILTER(isIRI(?property) && isIRI(?domain) && isIRI(?range))
}`;

/**
 * The statements of every object property between typed resources, counted
 * by property and class pair. Each statement is counted once: under the most
 * specific asserted class of its subject and of its object (one no other
 * asserted class of the same resource is a subclass of), the least IRI in
 * code-point order when several remain.
 */
export const CLASS_EDGE_OBSERVATIONS_QUERY = `PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?property ?subjectClass ?objectClass (COUNT(*) AS ?count) WHERE {
  {
    SELECT ?s ?property ?o (MIN(STR(?sc)) AS ?subjectClass) (MIN(STR(?oc)) AS ?objectClass) WHERE {
      ?property a owl:ObjectProperty .
      ?s ?property ?o .
      ?s a ?sc .
      ?o a ?oc .
      FILTER(isIRI(?sc) && isIRI(?oc))
      FILTER NOT EXISTS { ?s a ?ssub . ?ssub rdfs:subClassOf+ ?sc . FILTER(?ssub != ?sc) }
      FILTER NOT EXISTS { ?o a ?osub . ?osub rdfs:subClassOf+ ?oc . FILTER(?osub != ?oc) }
    }
    GROUP BY ?s ?property ?o
  }
}
GROUP BY ?property ?subjectClass ?objectClass`;
