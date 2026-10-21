import type React from "react";
import { TermLink } from "../TermLink/index.js";
import type { LineageProps } from "./types.js";

/**
 * The subset-of glyph the lineage breadcrumb reads with — U+2282, "a is a
 * subclass of b". Kept as a named constant so the ancestry chain and any
 * future legend cannot drift apart on the symbol.
 */
const SUBCLASS_OF = "⊂";

/**
 * The class's ancestry as an ordered breadcrumb chain — the reference
 * ontology explorer's `.lineage`. `superclasses` arrives nearest-first
 * (direct parent, …, root — the same order the flat list marked "(direct)"
 * on the head), so the chain reads self ⊂ parent ⊂ … ⊂ root left to right.
 * Every ancestor is a real term link; the leaf (the class itself) is plain
 * text, since it is the page the reader is already on. Pure over data the
 * fragment already fetches — no query change.
 *
 * `import { Lineage } from "../Lineage/index.js";`
 */
export default function Lineage({
  self,
  ancestors,
  namespaces,
}: LineageProps): React.ReactElement {
  return (
    <p className="lineage">
      <span className="self">{self}</span>
      {ancestors.map((ancestor) => (
        <span key={ancestor.uri}>
          <span aria-hidden="true" className="glyph">
            {" "}
            {SUBCLASS_OF}{" "}
          </span>
          <TermLink
            label={ancestor.label}
            namespaces={namespaces}
            uri={ancestor.uri}
          />
        </span>
      ))}
    </p>
  );
}
