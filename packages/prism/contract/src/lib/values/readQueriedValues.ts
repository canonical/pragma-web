import type { ReadValue } from "../lens/index.js";

interface QueriedValue {
  readonly uri?: string | null;
  readonly _meta: { readonly title: string };
}

const toReadValue = (value: unknown): ReadValue =>
  typeof value === "object" && value !== null
    ? {
        text: (value as QueriedValue)._meta.title,
        uri: (value as QueriedValue).uri ?? null,
      }
    : { text: String(value), uri: null };

/**
 * The values a node's queried fields hold, by field: a list item by item,
 * a missing or null field as none.
 *
 * @param node - The node as the query `writeFieldValuesQuery` wrote answered it.
 * @param fields - The fields' served names.
 * @returns Each field's values.
 */
export function readQueriedValues(
  node: Readonly<Record<string, unknown>> | null,
  fields: readonly string[],
): Readonly<Record<string, readonly ReadValue[]>> {
  return Object.fromEntries(
    fields.map((name) => {
      const raw = node?.[name] ?? null;
      const items = raw === null ? [] : Array.isArray(raw) ? raw : [raw];
      return [name, items.map(toReadValue)];
    }),
  );
}
