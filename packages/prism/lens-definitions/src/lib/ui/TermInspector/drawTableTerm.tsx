import type { ReactNode } from "react";
import type { StubName } from "../../classGraph/types.js";

/**
 * Draw an edge table's term in its short form, `prefix:Local`, with a
 * break allowed right after the colon and nowhere inside a word: a narrow
 * column wraps the local name under its prefix whole. A term with no
 * prefix is drawn as it is named.
 *
 * @param name - The term's name, as `nameTableTerms` gives it.
 * @returns The term's text, ready for a cell's link.
 */
export default function drawTableTerm(name: StubName): ReactNode {
  if (name.term !== `${name.prefix}:${name.local}`) return name.term;
  return (
    <>
      {name.prefix}:<wbr />
      {name.local}
    </>
  );
}
