// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/OntologyPropertyChip_node.graphql.js";
import {
  useForeignPrefix,
  useProjectionLink,
} from "../../projections/index.js";
import { EntityChip } from "../../ui/index.js";
import { findLocalName } from "../../utils/index.js";
import { PROPERTY_MARK_ICON } from "../constants.js";
import type { OntologyPropertyChipProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields OntologyPropertyChip reads from the OntologyProperty it
 * renders: its IRI, its address and the local name its name falls back to,
 * and its label.
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
 * An ontology property as an inline mention, in the slot order: the
 * property glyph as its mark, then its name in the chip's pill, linked to
 * its home when the site has one and inert text when it has none or
 * `linked` is false. It has no peek: the peek reads a `Node`, which a
 * property is not. The name is the property's label, or the local name of its IRI when
 * it has none. A property's address is its absolute IRI, which has no
 * compact form, so `useForeignPrefix` finds no prefix for it. A passage's own link text, given as
 * `children`, stands in for the name.
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
 *   site's homes, its link from the projection provider and the page's
 *   ambient namespace.
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
  const prefix = useForeignPrefix(data.uri);
  return (
    <EntityChip
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={PROPERTY_MARK_ICON} />}
      prefix={prefix}
      title={children ?? data.label ?? findLocalName(data.uri)}
    />
  );
}
