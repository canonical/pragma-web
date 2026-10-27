/**
 * Assert that an aliased fragment spread holds a key. Relay types an
 * `@alias` spread under an abstract field as nullable even inside the
 * inline fragment that guarantees its type, so a reader of the key
 * asserts it here instead of casting it away.
 *
 * @param key - The aliased spread's value.
 * @param name - The fragment's name, for the error.
 * @returns The key.
 * @throws When the spread holds no key: the node is not of the fragment's
 *   type, which the enclosing type condition rules out.
 */
export default function assertFragment<TKey>(
  key: TKey | null | undefined,
  name: string,
): TKey {
  if (key === null || key === undefined) {
    throw new Error(`the ${name} spread holds no fragment key`);
  }
  return key;
}
