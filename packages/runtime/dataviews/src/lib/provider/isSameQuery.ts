import { areSlicesEqual, type Query } from "../query/index.js";

/**
 * Whether the location cannot tell two queries apart. Every window member
 * the grammar spells is compared; `collapsed` is not, because it has no
 * spelling — collapsing a group must not provoke a write of the same URL.
 */
export default function isSameQuery(a: Query, b: Query): boolean {
  return (
    (a.slice === b.slice || areSlicesEqual(a.slice, b.slice)) &&
    a.window.page === b.window.page &&
    a.window.size === b.window.size &&
    a.window.cursor === b.window.cursor
  );
}
