import { EntityChip } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import entitySummaryFragmentNode from "../../../../__generated__/EntitySummary_node.graphql.js";
import { Message } from "../../../i18n/index.js";
import type { EntitySummaryProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** What the summary reads: the entity's own descriptive text and its class. */
const declareEntitySummaryFragment = (): unknown => graphql`
  fragment EntitySummary_node on Node {
    _meta {
      definition
      comment
      type {
        ...EntityChip_node
      }
    }
  }
`;
void declareEntitySummaryFragment;
/* v8 ignore stop */

const componentCssClassName = "ds entity-summary";

/**
 * The entity's summary: its definition and its comment, each only when the
 * graph asserts one, then the class it is an instance of, mentioned through
 * the site's chip projection so it links to the class's home when the site
 * declares one.
 *
 * `import { EntitySummary } from "./common/EntitySummary/index.js";`
 */
export default function EntitySummary({
  className,
  node,
  ...props
}: EntitySummaryProps): ReactElement {
  const { _meta: meta } = useFragment(entitySummaryFragmentNode, node);
  return (
    <div
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      {meta.definition ? <p className="definition">{meta.definition}</p> : null}
      {meta.comment ? <p className="comment">{meta.comment}</p> : null}
      <p className="type">
        <Message
          elements={{ type: <EntityChip node={meta.type} /> }}
          id="page.type"
        />
      </p>
    </div>
  );
}
