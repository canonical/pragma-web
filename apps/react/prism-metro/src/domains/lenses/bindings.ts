import { defineBinding } from "@canonical/prism-core";

// The two classes of the metro ontology the site gives an entity lens, each
// with the GraphQL type the metro provider serves its instances as. They are
// grouped so the site's binding check reads them side by side.

/** The stations lens's class: `metro:Station`, served as `Station`. */
export const STATIONS_BINDING = defineBinding({
  id: "stations",
  classUri: "metro:Station",
  typename: "Station",
});

/** The lines lens's class: `metro:Line`, served as `Line`. */
export const LINES_BINDING = defineBinding({
  id: "lines",
  classUri: "metro:Line",
  typename: "Line",
});
