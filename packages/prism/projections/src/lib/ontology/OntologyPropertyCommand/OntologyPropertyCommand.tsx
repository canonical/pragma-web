// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/OntologyPropertyCommand_node.graphql.js";
import { useMessages } from "../../i18n/index.js";
import { useProjectionLink } from "../../projections/index.js";
import { EntityCommand } from "../../ui/index.js";
import { findLocalName } from "../../utils/index.js";
import { PROPERTY_KIND_LABELS } from "../constants.js";
import type { OntologyPropertyCommandProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields OntologyPropertyCommand reads from the OntologyProperty it
 * renders: its IRI, its label, its kind, its range and the class it is
 * declared on.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment OntologyPropertyCommand_node on OntologyProperty {
    __typename
    uri
    label
    kind
    range
    domain {
      _meta {
        title
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds ontology-property-command";

/**
 * An ontology property as a 56px command-palette result: its name on the
 * first line, linked to its home when the site has one and inert text when
 * it has none; "kind in location" on the second, the location the class it
 * is declared on; and its range as the vital at the end. The name is the
 * property's label, or the local name of its IRI when it has none.
 *
 * A property is not a `Node`, so no dispatcher renders it: a lens spreads
 * `...OntologyPropertyCommand_node` where it selects the property.
 *
 * Native props reach the result's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { OntologyPropertyCommand } from "@canonical/prism-projections";`
 *
 * @implements prism.component.ontology_property_command
 * @note Impure: reads its property from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its kind's
 *   label from the translator in scope.
 */
export default function OntologyPropertyCommand({
  node,
  className,
  ...props
}: OntologyPropertyCommandProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const href = useHome({ __typename: data.__typename, uri: data.uri });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  return (
    <EntityCommand
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={t(PROPERTY_KIND_LABELS[data.kind] ?? "property.kind.other")}
      LinkComponent={LinkComponent}
      location={data.domain?._meta.title}
      title={data.label ?? findLocalName(data.uri)}
      vital={<code>{data.range}</code>}
    />
  );
}
