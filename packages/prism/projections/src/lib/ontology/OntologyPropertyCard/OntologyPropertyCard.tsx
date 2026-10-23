// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/OntologyPropertyCard_node.graphql.js";
import { useMessages } from "../../i18n/index.js";
import { useProjectionLink } from "../../projections/index.js";
import { EntityCard } from "../../ui/index.js";
import { findLocalName } from "../../utils/index.js";
import { PROPERTY_KIND_LABELS } from "../constants.js";
import type { OntologyPropertyCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields OntologyPropertyCard reads from the OntologyProperty it
 * renders: its IRI, its label and kind, its definition, its range, whether
 * it is functional, the class it is declared on and its inverse.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment OntologyPropertyCard_node on OntologyProperty {
    __typename
    uri
    label
    kind
    definition
    range
    functional
    domain {
      _meta {
        title
      }
    }
    inverse {
      uri
      label
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds ontology-property-card";

/**
 * An ontology property as a card in a grid of entities: its name as the
 * heading, linked to its home when the site has one and inert text when it
 * has none; then "kind in location", the location the class it is declared
 * on; its definition; its range and, when it has one, its inverse as key
 * values; and "functional" as the footer's vital for a functional property.
 * A name is the property's label, or the local name of its IRI when it has
 * none.
 *
 * A property is not a `Node`, so no dispatcher renders it: a lens spreads
 * `...OntologyPropertyCard_node` where it selects the property.
 *
 * Native props reach the card's `<div>` root; a consumer `className` merges
 * after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { OntologyPropertyCard } from "@canonical/prism-projections";`
 *
 * @implements prism.component.ontology_property_card
 * @note Impure: reads its property from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its words from
 *   the translator in scope.
 */
export default function OntologyPropertyCard({
  node,
  className,
  ...props
}: OntologyPropertyCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const href = useHome({ __typename: data.__typename, uri: data.uri });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  const kind = t(PROPERTY_KIND_LABELS[data.kind] ?? "property.kind.other");
  const domain = data.domain?._meta.title;
  const { inverse } = data;
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      keyValues={[
        {
          key: t("property.range"),
          value: <code className="identifier">{data.range}</code>,
        },
        ...(inverse == null
          ? []
          : [
              {
                key: t("property.inverse"),
                value: inverse.label ?? findLocalName(inverse.uri),
              },
            ]),
      ]}
      kind={
        domain === undefined
          ? kind
          : t("entity.context", { kind, location: domain })
      }
      LinkComponent={LinkComponent}
      summary={data.definition ?? undefined}
      title={data.label ?? findLocalName(data.uri)}
      vitals={data.functional ? [t("property.functional")] : undefined}
    />
  );
}
