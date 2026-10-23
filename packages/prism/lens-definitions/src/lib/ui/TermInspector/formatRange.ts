import compactUri from "../../compactUri.js";
import type { OntologyNamespace } from "../../types.js";

/**
 * The XML Schema datatypes a datatype property's range names, compacted
 * under the prefix every RDF reader knows them by.
 */
const XSD: OntologyNamespace = {
  prefix: "xsd",
  namespace: "http://www.w3.org/2001/XMLSchema#",
};

/**
 * Write a property's range compactly: a class of the graph under its
 * ontology's prefix (`https://…/Subcomponent` → `ds:Subcomponent`), an XML
 * Schema datatype under `xsd:`, anything else as given.
 */
export default function formatRange(
  range: string,
  namespaces: readonly OntologyNamespace[],
): string {
  return compactUri(range, [...namespaces, XSD]);
}
