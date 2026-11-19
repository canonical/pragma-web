/**
 * What the graph checks ask a site's graph: the explorer's classes with
 * their superclasses and object properties, and the class edges with their counts.
 */
export const SERVED_GRAPH_QUERY = `{
  ontologies {
    prefix
    namespace
    classes { uri instanceCount superclass { uri } }
    properties { uri kind domain { uri } range }
  }
  classEdges { property subjectClass objectClass count declared }
}`;
