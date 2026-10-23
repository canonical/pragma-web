import { expect } from "vitest";
import type { PublishedFields } from "./types.js";

/** Reads `_meta` straight off a node. */
export const readNodeMeta = (node: unknown): PublishedFields =>
  (node as { _meta: PublishedFields })._meta;

/** Selects `_meta` straight on a node. */
export const selectOnNode = (meta: string): string => meta;

/**
 * Read every name a value's `_meta.fields` publishes, and pass each one back
 * through `_meta.field(name:)`: every published name must answer with
 * itself. `run` executes a query and fails on any GraphQL error,
 * `selection` places the `_meta` selection on the value under the node at
 * `uri`, and `readMeta` reads it back.
 *
 * @note Impure: executes queries through `run` and asserts with vitest's
 * `expect`.
 */
export const expectFieldsRoundTrip = async (
  run: (source: string) => Promise<Record<string, unknown>>,
  uri: string,
  selection: (meta: string) => string,
  readMeta: (node: unknown) => PublishedFields,
): Promise<void> => {
  const listed = await run(
    `{ node(id: "${uri}") { ${selection("_meta { fields { name } }")} } }`,
  );
  const names = (readMeta(listed.node).fields ?? []).map((field) => field.name);
  expect(names.length).toBeGreaterThan(0);
  for (const name of names) {
    const roundTrip = await run(
      `{ node(id: "${uri}") { ${selection(`_meta { field(name: "${name}") { name } }`)} } }`,
    );
    expect(readMeta(roundTrip.node).field).toEqual({ name });
  }
};
