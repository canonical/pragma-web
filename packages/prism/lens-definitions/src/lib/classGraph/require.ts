/**
 * The layout's invariant reads: an element of a list, an entry of a map
 * and a value the layout itself set, where a missing value means the layout is
 * wrong, so the read fails loudly instead of carrying `undefined` on.
 */

/**
 * Read the element at an index the caller knows is in range.
 *
 * @throws When the index is out of range.
 */
export function requireAt<Value>(list: readonly Value[], index: number): Value {
  const value = list.at(index);
  if (value === undefined) {
    throw new Error(`the class graph has no element at ${index}`);
  }
  return value;
}

/**
 * Read the entry of a key the caller knows is present.
 *
 * @throws When the map holds no entry for the key.
 */
export function requireEntry<Key, Value>(
  map: ReadonlyMap<Key, Value>,
  key: Key,
): Value {
  const value = map.get(key);
  if (value === undefined) {
    throw new Error(`the class graph has no entry for ${String(key)}`);
  }
  return value;
}

/**
 * Read a value the caller knows is set.
 *
 * @throws When the value is `undefined`, naming what was missing.
 */
export function requireDefined<Value>(
  value: Value | undefined,
  what: string,
): Value {
  if (value === undefined) throw new Error(`the class graph has no ${what}`);
  return value;
}
