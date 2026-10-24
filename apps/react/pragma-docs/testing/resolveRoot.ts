import type { MockResolver } from "relay-test-utils";

/**
 * Create a mock resolver that answers `entity` for the operation's root
 * field only. A mock environment resolves every object of a type through
 * that type's resolver, so without it a nested object of the root's type
 * would answer as the root, over the values its parent gives it.
 *
 * @param entity - The object the root field answers.
 * @returns A resolver to register under the root's type.
 */
export default function resolveRoot(entity: object): MockResolver {
  return (context) => (context.path?.length === 1 ? entity : undefined);
}
