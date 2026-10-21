import { Link } from "@canonical/router-react";
import type React from "react";
import { useMessages } from "../../../i18n/index.js";
import type { TermNodeProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds term-node";

/**
 * A class node: a real term link, so the graph's nodes are anchors — they
 * SSR as content, hover-prefetch their term, and navigate through the
 * router (URL state, never component state). Selection is the address:
 * the router's `Link` stamps `aria-current="page"` on the current term's
 * node, which the stylesheet raises.
 *
 * Abstract classes are marked twice over: the label
 * goes italic and a small ABSTRACT tag rides underneath — real text, so
 * the distinction survives with styling off rather than living in colour
 * alone. The tag sits OUTSIDE the anchor: a node's accessible name must
 * be the term itself, never the term plus its decoration.
 *
 * The label is `title`-attributed as well as rendered: node geometry is
 * ESTIMATED from the label (no text measurement exists on the server), so
 * a long class name ellipsises and the tooltip keeps it recoverable.
 *
 * `import { TermNode } from "./common/TermNode/index.js";`
 */
export default function TermNode({ node }: TermNodeProps): React.ReactElement {
  const t = useMessages();
  return (
    <div
      className={[
        componentCssClassName,
        node.data.isAbstract ? "abstract" : "",
        node.className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-id={node.id}
      style={{
        insetInlineStart: node.x - node.width / 2,
        insetBlockStart: node.y - node.height / 2,
        inlineSize: node.width,
        blockSize: node.height,
      }}
    >
      <Link
        className="link"
        params={{ term: node.data.term }}
        title={node.data.label}
        to="definitionsTerm"
      >
        {node.data.label}
      </Link>
      {node.data.isAbstract ? (
        <span className="tag">{t("well.abstract")}</span>
      ) : null}
    </div>
  );
}
