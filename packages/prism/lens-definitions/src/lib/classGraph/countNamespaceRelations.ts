/**
 * Count the relations a namespace states: the object properties its
 * ontology declares, whatever their ends. A namespace's box on the canvas
 * and its row in the inspector's Namespaces state this one figure.
 *
 * @param properties - The properties the namespace's ontology declares.
 * @returns How many of them are object properties.
 */
export default function countNamespaceRelations(
  properties: readonly { readonly kind: string }[],
): number {
  return properties.filter((property) => property.kind === "OBJECT").length;
}
