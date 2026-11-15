// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/OntologyClassGraphNode_node.graphql.js";
import {
  useForeignPrefix,
  useProjectionLink,
} from "../../projections/index.js";
import { EntityGraphNode } from "../../ui/index.js";
import { CLASS_MARK_ICON } from "../constants.js";
import type { OntologyClassGraphNodeProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields OntologyClassGraphNode reads from the OntologyClass it
 * renders: its title, its compact address and whether it is abstract.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment OntologyClassGraphNode_node on OntologyClass {
    __typename
    isAbstract
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds ontology-class-graph-node";

/**
 * An ontology class as a node of a graph, native SVG, in the slot order:
 * the class glyph as its mark, then on the first line its namespace
 * prefix when it differs from the page's ambient one and its title,
 * linked to its home when the site has one and inert text when it has
 * none. It gives no kind, since its mark says it is a class; an abstract
 * class's box is hollow, the graph's mark for a kind set apart.
 *
 * It is the graph node's arm for `OntologyClass`: `GraphNodeProjection`
 * renders it.
 *
 * Native props reach the node's SVG `<g>` root, where a graph sets its
 * transform; a consumer `className` merges after the projection's own, and
 * the root carries the typename as `data-type`.
 *
 * `import { OntologyClassGraphNode } from "@canonical/prism-projections";`
 *
 * @implements prism.component.ontology_class_graph_node
 * @note Impure: reads its class from the Relay store, its home from the
 *   site's homes, its link from the projection provider, the page's
 *   ambient namespace.
 */
export default function OntologyClassGraphNode({
  node,
  className,
  ...props
}: OntologyClassGraphNodeProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(curie);
  return (
    <EntityGraphNode
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      hollow={data.isAbstract}
      LinkComponent={LinkComponent}
      mark={<Icon icon={CLASS_MARK_ICON} />}
      prefix={prefix}
      title={title}
    />
  );
}
