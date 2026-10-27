/**
 * Assert a site dispatcher's slot resolved the arm its typename selects:
 * the key the slot holds under that type's alias, which Relay leaves null
 * when the node is of another type.
 *
 * @param key - The slot's aliased key for the type.
 * @param typename - The typename the package's dispatcher handed over.
 * @returns The key, for the arm to read.
 * @throws When the key is null or undefined: the typename names a metro
 *   type, but the store holds no data under that type's spread.
 */
export default function assertSiteKey<TKey>(
  key: TKey | null | undefined,
  typename: string,
): TKey {
  if (key === null || key === undefined) {
    throw new Error(`the site slot holds no ${typename} data for this node`);
  }
  return key;
}
