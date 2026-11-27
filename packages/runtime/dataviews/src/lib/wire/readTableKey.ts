import { ARRANGEMENT_QUERY_PATTERN } from "./constants.js";
import type { ArrangementKeyPart } from "./types.js";

/** One table's order or hidden key, read back: the table's id and the part. */
type TableKey = {
  readonly table: string;
  readonly part: Extract<ArrangementKeyPart, "order" | "hidden">;
};

/**
 * The table and part a parameter's key carries, however the link spelled
 * the id; null for a key that names no table's order or hidden columns.
 */
export default function readTableKey(key: string): TableKey | null {
  const match = ARRANGEMENT_QUERY_PATTERN.exec(key);
  const spelled = match?.at(1);
  const part = match?.at(2);
  if (spelled === undefined || (part !== "order" && part !== "hidden")) {
    return null;
  }
  try {
    return { table: decodeURIComponent(spelled), part };
  } catch {
    // A spelling no id decodes from names no table.
    return null;
  }
}
