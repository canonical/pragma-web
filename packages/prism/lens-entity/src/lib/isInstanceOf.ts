/**
 * Whether an entity whose class is `type` is an instance of the class
 * `classIri`: its own class is that class, or that class is among its own
 * class's superclasses.
 *
 * `OntologyClass.superclasses` is the transitive chain, nearest first, so an
 * `Interchange` (a `Station`, which is a `Stop`) is an instance of both. The
 * entity route resolves any node by its address, and this is what keeps a
 * `Line` from rendering under the stations lens.
 *
 * @param type - The entity's class, with its superclasses' IRIs.
 * @param classIri - The absolute IRI of the class to test against.
 * @returns `true` when the entity is an instance of `classIri`.
 */
export default function isInstanceOf(
  type: {
    readonly uri: string;
    readonly superclasses: readonly { readonly uri: string }[];
  },
  classIri: string,
): boolean {
  return (
    type.uri === classIri ||
    type.superclasses.some((superclass) => superclass.uri === classIri)
  );
}
