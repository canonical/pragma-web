/**
 * The queries a provider runs against its own schema to serve list values
 * and facets: they read only what the contract and its lens serve, so the
 * same text works on every provider.
 */

/** A served `ClassProperty` with the lens facts `deriveListFields` reads. */
const SERVED_FIELD_SELECTION =
  "name property { uri label kind range } singular group { uri label order } order role visibility";

/** One node's type name and its class's served fields. */
export const NODE_FIELDS_QUERY = `query NodeFields($id: ID!) { node(id: $id) { __typename _meta { fields { ${SERVED_FIELD_SELECTION} } } } }`;

/** A class's served fields and how many instances it has, its subclasses' included. */
export const CLASS_FIELDS_QUERY = `query ClassFields($uri: String!) { ontologyClass(uri: $uri) { uri properties { ${SERVED_FIELD_SELECTION} } instanceCount } }`;

/** A class's instances, each with its type name and its own class. */
export const CLASS_INSTANCES_QUERY = `query ClassInstances($uri: String!, $first: Int) { ontologyClass(uri: $uri) { instances(first: $first) { edges { node { uri __typename _meta { type { uri label } } } } } } }`;

/** What a field holding a node is read by: its IRI and its title. */
export const NODE_VALUE_SELECTION = "{ uri _meta { title } }";

/** What a field holding a value without an IRI is read by: its title. */
export const EMBEDDED_VALUE_SELECTION = "{ _meta { title } }";

/** The name of the contract's node interface. */
export const NODE_INTERFACE = "Node";

/**
 * The types the two list extensions add to a provider's schema. A provider
 * also declares `values` on `Node` and on each of its implementations, and
 * `Query.facetedInstances` returning `FacetedConnection!`.
 */
export const LIST_EXTENSION_TYPES_SDL = `
"A node's value for one list field."
type NodeValue {
  "The field's served name."
  field: ID!
  "The field's label."
  label: String!
  "The values' texts joined, or null when the node has none."
  text: String
  "The IRI of the value when it is exactly one entity."
  uri: String
  "How the field's values read: text, number, flag, date or choices."
  type: String!
}

"Keeps the nodes holding one of \`values\` for \`field\`; a null value stands for none."
input FieldFilter {
  field: String!
  values: [ID]
}

"Orders a set by one field, the nodes without a value last."
input FieldSort {
  field: String!
  descending: Boolean
}

"One bucket of a facet; a null value is the nodes with none."
type FacetValue {
  value: ID
  label: String
  count: Int!
}

"A field's buckets, counted with every filter but the field's own."
type Facet {
  field: String!
  label: String!
  values: [FacetValue!]!
}
`;
