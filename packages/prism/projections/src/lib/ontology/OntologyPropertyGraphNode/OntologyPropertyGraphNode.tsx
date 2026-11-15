// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/OntologyPropertyGraphNode_node.graphql.js";
import {
  useForeignPrefix,
  useProjectionLink,
} from "../../projections/index.js";
import { EntityGraphNode } from "../../ui/index.js";
import { findLocalName } from "../../utils/index.js";
import { PROPERTY_MARK_ICON } from "../constants.js";
import type { OntologyPropertyGraphNodeProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields OntologyPropertyGraphNode reads from the OntologyProperty it
 * renders: its IRI, its label and its namespace.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment OntologyPropertyGraphNode_node on OntologyProperty {
    __typename
    uri
    label
    namespace
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds ontology-property-graph-node";

/**
 * An ontology property as a node of a graph, native SVG, in the slot
 * order: the property glyph as its mark, its name on the first line,
 * linked to its home when the site has one and inert text when it has
 * none. It gives no kind, since its mark says it is a property. The name is the property's label, or the local name of its IRI when
 * it has none. Its prefix is its namespace's, through
 * `useForeignPrefix({ namespace })`: shown off the page's ambient
 * namespace when the provider serves the namespace as a prefix name, and
 * never when it serves an IRI.
 *
 * A property is not a `Node`, so no dispatcher renders it: a lens spreads
 * `...OntologyPropertyGraphNode_node` where it selects the property.
 *
 * Native props reach the node's SVG `<g>` root, where a graph sets its
 * transform; a consumer `className` merges after the projection's own, and
 * the root carries the typename as `data-type`.
 *
 * `import { OntologyPropertyGraphNode } from "@canonical/prism-projections";`
 *
 * @implements prism.component.ontology_property_graph_node
 * @note Impure: reads its property from the Relay store, its home from the
 *   site's homes, its link from the projection provider, the page's
 *   ambient namespace and its kind from the translator in scope.
 */
export default function OntologyPropertyGraphNode({
  node,
  className,
  ...props
}: OntologyPropertyGraphNodeProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const href = useHome({ __typename: data.__typename, uri: data.uri });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix({ namespace: data.namespace });
  return (
    <EntityGraphNode
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={PROPERTY_MARK_ICON} />}
      prefix={prefix}
      title={data.label ?? findLocalName(data.uri)}
    />
  );
}
