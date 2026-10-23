// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/OntologyPropertyChip_node.graphql.js";
import { useProjectionLink } from "../../projections/index.js";
import { EntityChip } from "../../ui/index.js";
import { findLocalName } from "../../utils/index.js";
import type { OntologyPropertyChipProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields OntologyPropertyChip reads from the OntologyProperty it
 * renders: its IRI, its only address, and its label.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment OntologyPropertyChip_node on OntologyProperty {
    __typename
    uri
    label
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds ontology-property-chip";

/**
 * An ontology property as an inline mention: its name in the chip's pill,
 * linked to its home when the site has one and inert text when it has none.
 * The name is the property's label, or the local name of its IRI when it
 * has none; a passage's own link text, given as `children`, stands in for
 * it.
 *
 * A property is not a `Node`, so no dispatcher renders it: a lens spreads
 * `...OntologyPropertyChip_node` where it selects the property.
 *
 * Native props reach the chip's `<span>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { OntologyPropertyChip } from "@canonical/prism-projections";`
 *
 * @implements prism.component.ontology_property_chip
 * @note Impure: reads its property from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function OntologyPropertyChip({
  node,
  children,
  className,
  ...props
}: OntologyPropertyChipProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const href = useHome({ __typename: data.__typename, uri: data.uri });
  const LinkComponent = useProjectionLink();
  return (
    <EntityChip
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      value={children ?? data.label ?? findLocalName(data.uri)}
    />
  );
}
