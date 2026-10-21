/**
 * Static fixtures shared by the package's suites: graph payloads exactly as
 * a provider answers them.
 */

import type { NodePayload } from "./types.js";

/** A node of a type the site homes: an ontology class. */
export const ONTOLOGY_CLASS_NODE: NodePayload = {
  __typename: "OntologyClass",
  uri: "https://ds.canonical.com/UIBlock",
  _meta: {
    curie: "ds:UIBlock",
    title: "UI Block",
    type: { uri: "http://www.w3.org/2002/07/owl#Class" },
  },
};

/** A node of a type no map names and the site does not home. */
export const STATION_NODE: NodePayload = {
  __typename: "Station",
  uri: "https://metro.example/station/kings-cross",
  _meta: {
    curie: "metro:station/kings-cross",
    title: "King's Cross",
    type: { uri: "https://metro.example/Station" },
  },
};

/** The href the site's `thing` route builds for `ONTOLOGY_CLASS_NODE`. */
export const ONTOLOGY_CLASS_HREF = "/things/ds%3AUIBlock";
