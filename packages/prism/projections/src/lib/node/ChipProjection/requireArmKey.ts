/**
 * Return the fragment key a switch's case reads, asserting the node's
 * aliased spread for the case's type is there: a node whose typename names
 * the case always carries it, so a missing one is a composite fragment
 * that spreads no arm for that type.
 *
 * @param key - The aliased spread of the case's type.
 * @param typename - The case's typename, named in the error.
 * @throws When the node carries no spread for its own type.
 */
export default function requireArmKey<TKey>(
  key: TKey | null | undefined,
  typename: string,
): TKey {
  if (key === null || key === undefined) {
    throw new Error(
      `the node is a ${typename} but its composite fragment spreads no ${typename} arm`,
    );
  }
  return key;
}
