/**
 * The static data the lens's tests share.
 */

/** The namespaces the metro graph declares, in its own order. */
export const METRO_NAMESPACES = [
  { prefix: "metro", namespace: "https://metro.example/onto#" },
  { prefix: "geo", namespace: "https://geo.example/onto#" },
  { prefix: "rdfs", namespace: "http://www.w3.org/2000/01/rdf-schema#" },
] as const;
