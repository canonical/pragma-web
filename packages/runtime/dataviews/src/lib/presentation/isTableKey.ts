import { TABLE_KEY_PATTERN } from "./constants.js";

/**
 * Whether a presentation key is one a table keeps: its order, its hidden
 * columns, or a column's width, under the table's id.
 */
export default function isTableKey(key: string): boolean {
  return TABLE_KEY_PATTERN.test(key);
}
