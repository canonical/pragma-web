// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/OntologyPropertyRow_node.graphql.js";
import {
  useForeignPrefix,
  useProjectionLink,
} from "../../projections/index.js";
import { EntityRow } from "../../ui/index.js";
import { findLocalName } from "../../utils/index.js";
import { PROPERTY_MARK_ICON } from "../constants.js";
import type { OntologyPropertyRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields OntologyPropertyRow reads from the OntologyProperty it
 * renders: its IRI, its label and its definition.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment OntologyPropertyRow_node on OntologyProperty {
    __typename
    uri
    label
    definition
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds ontology-property-row";

/**
 * An ontology property as a 32px list entry, in the slot order: the
 * property glyph as its mark, its name linked to its home when the site
 * has one and inert text when it has none. It gives no kind, since its
 * mark says it is a property. A row opted into two lines
 * (`lines="two"`) sets the property's definition under the name. The name is the property's label, or the local name of its IRI when
 * it has none. A property's address is its absolute IRI, which has no
 * compact form, so `useForeignPrefix` finds no prefix for it.
 *
 * A property is not a `Node`, so no dispatcher renders it: a lens spreads
 * `...OntologyPropertyRow_node` where it selects the property.
 *
 * Native props reach the row's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { OntologyPropertyRow } from "@canonical/prism-projections";`
 *
 * @implements prism.component.ontology_property_row
 * @note Impure: reads its property from the Relay store, its home from the
 *   site's homes, its link from the projection provider, the page's
 *   ambient namespace and its word from the translator in scope.
 */
export default function OntologyPropertyRow({
  node,
  className,
  ...props
}: OntologyPropertyRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const href = useHome({ __typename: data.__typename, uri: data.uri });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(data.uri);
  return (
    <EntityRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={PROPERTY_MARK_ICON} />}
      prefix={prefix}
      summary={data.definition ?? undefined}
      title={data.label ?? findLocalName(data.uri)}
    />
  );
}
