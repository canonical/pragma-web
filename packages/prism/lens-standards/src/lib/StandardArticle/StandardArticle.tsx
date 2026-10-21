import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import type { StandardArticle_standard$key } from "../../__generated__/StandardArticle_standard.graphql.js";
import standardArticleFragmentNode from "../../__generated__/StandardArticle_standard.graphql.js";
import { useMessages } from "../i18n/index.js";
import { StandardProse } from "./common/StandardProse/index.js";
import type { StandardArticleProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * Codegen source of truth for `StandardArticle_standard`. Nothing calls it:
 * the hook reads the compiled artifact.
 *
 * THE FRAGMENT IS ON `Node`, not on a standards type. A provider names its
 * own type for the bound class (`CodeStandard` on one that loaded pragma's
 * `cs:` vocabulary); `Node` is the contract's own interface, and everything
 * this article renders is on `_meta`. `_meta.title` and `_meta.definition`
 * resolve through the provider's label and definition tiers, which on
 * pragma's provider reach a standard's `cs:name` and `cs:description`.
 */
const declareStandardArticleFragment = (): unknown => graphql`
  fragment StandardArticle_standard on Node {
    uri
    _meta {
      curie
      title
      definition
      type {
        uri
        _meta {
          title
        }
      }
    }
  }
`;
void declareStandardArticleFragment;
/* v8 ignore stop */

const componentCssClassName = "ds standard-article";

/**
 * Split the description's plain text into paragraph blocks on blank lines.
 * Single newlines survive inside a block, where the stylesheet keeps them
 * (`white-space: pre-line`), so hand-written bullet lines keep their breaks.
 */
function splitProseBlocks(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);
}

/**
 * The reading column: the standard's identity header (title, compact
 * address, class) and its body.
 *
 * The body is the standard's prose when it has some, rendered as Markdown
 * with a chip for every entity it links to (`StandardProse`). Without prose
 * it is the graph's `_meta.definition` rendered as plain-text paragraph
 * blocks, so inline backticks and `*emphasis*` marks in the source text show
 * verbatim. The title is `_meta.title`, which is total: the
 * provider computes a fallback chain ending in the IRI's local name, so
 * there is no fallback here. `_meta.curie` carries the compact identity for
 * the reader, while `uri` stays the absolute IRI Relay keys on and
 * `node(id:)` accepts.
 *
 * `import { StandardArticle } from "./StandardArticle/index.js";`
 */
export default function StandardArticle({
  body,
  className,
  standard,
  ...props
}: StandardArticleProps): ReactElement {
  const t = useMessages();
  const data = useFragment<StandardArticle_standard$key>(
    standardArticleFragmentNode,
    standard,
  );

  return (
    <article
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-slot="reading-canvas"
    >
      <header className="header">
        <h1 className="heading" id="standard-reading-title">
          {data._meta.title}
        </h1>
        <p className="meta">
          <code>{data._meta.curie}</code>
          {/* The instance's own class is the one grouping axis the contract
              exposes, the same axis the index groups by. */}
          <span className="class">
            {t("article.class", { class: data._meta.type._meta.title })}
          </span>
        </p>
      </header>
      {body ? (
        <StandardProse body={body} />
      ) : data._meta.definition ? (
        <div className="prose">
          {splitProseBlocks(data._meta.definition).map((block) => (
            <p className="paragraph" key={block}>
              {block}
            </p>
          ))}
        </div>
      ) : (
        <p className="prose">{t("article.definition.none")}</p>
      )}
    </article>
  );
}
