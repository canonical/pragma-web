// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/OntologyClassGraphNode_node.graphql.js";
import { useMessages } from "../../i18n/index.js";
import { useProjectionLink } from "../../projections/index.js";
import { EntityGraphNode } from "../../ui/index.js";
import { findCuriePrefix } from "../../utils/index.js";
import type { OntologyClassGraphNodeProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields OntologyClassGraphNode reads from the OntologyClass it
 * renders: its compact address and whether it is abstract.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment OntologyClassGraphNode_node on OntologyClass {
    __typename
    isAbstract
    _meta {
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds ontology-class-graph-node";

/**
 * An ontology class as a node of a graph, native SVG: its compact address
 * (`ds:Layout`) on the first line, linked to its home when the site has
 * one and inert text when it has none, then "Abstract class in ds" muted,
 * its abstraction in its namespace's prefix. A class whose address did not
 * compact names its abstraction alone.
 *
 * Native props reach the node's SVG `<g>` root, where a graph sets its
 * transform; a consumer `className` merges after the projection's own, and
 * the root carries the typename as `data-type`.
 *
 * `import { OntologyClassGraphNode } from "@canonical/prism-projections";`
 *
 * @implements prism.component.ontology_class_graph_node
 * @note Impure: reads its class from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its kind from
 *   the translator in scope.
 */
export default function OntologyClassGraphNode({
  node,
  className,
  ...props
}: OntologyClassGraphNodeProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  return (
    <EntityGraphNode
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={t(data.isAbstract ? "class.kind.abstract" : "class.kind")}
      LinkComponent={LinkComponent}
      location={findCuriePrefix(curie)}
      title={curie}
    />
  );
}
