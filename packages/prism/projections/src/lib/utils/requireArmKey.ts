/**
 * Return the fragment key a switch's case reads, asserting the node's
 * aliased spread for the case's type is there: a node whose typename names
 * the case always carries it, so a missing one is a switch's fragment that
 * spreads no arm for that type.
 *
 * Every switch over a node's typename, the package's and a site's, reads
 * its case's key through it: `node={requireArmKey(data.Station,
 * data.__typename)}`.
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
      `requireArmKey: the node is a ${typename}, but the switch's fragment spreads no ${typename} arm`,
    );
  }
  return key;
}
