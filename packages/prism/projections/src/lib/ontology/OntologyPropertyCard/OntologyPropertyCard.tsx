// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/OntologyPropertyCard_node.graphql.js";
import { useMessages } from "../../i18n/index.js";
import {
  useForeignPrefix,
  useProjectionLink,
} from "../../projections/index.js";
import { EntityCard } from "../../ui/index.js";
import { findLocalName } from "../../utils/index.js";
import { PROPERTY_MARK_ICON } from "../constants.js";
import type { OntologyPropertyCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields OntologyPropertyCard reads from the OntologyProperty it
 * renders: its IRI, label and definition, its range, whether it is
 * functional, the title of the class it is declared on and its inverse.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment OntologyPropertyCard_node on OntologyProperty {
    __typename
    uri
    label
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
 * An ontology property as a card in a grid of entities, in the slot
 * order: the property glyph as its mark, its name as the heading, linked
 * to its home when the site has one and inert text when it has none; its
 * definition; as facts, the class it is declared on, its range and, when
 * it has one, its inverse; and "functional" as the status of a functional
 * property. It passes no address and no kind, which its mark states. The name is the property's label, or the local name of its IRI when
 * it has none. A property's address is its absolute IRI, which has no
 * compact form, so `useForeignPrefix` finds no prefix for it.
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
 *   site's homes, its link from the projection provider, the page's
 *   ambient namespace and its words from the translator in scope.
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
  const domain = data.domain?._meta.title;
  const { inverse } = data;
  const prefix = useForeignPrefix(data.uri);
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      facts={[
        ...(domain === undefined
          ? []
          : [
              {
                property: "domain",
                label: t("property.domain"),
                value: domain,
              },
            ]),
        {
          property: "range",
          label: t("property.range"),
          value: <code className="identifier">{data.range}</code>,
        },
        ...(inverse == null
          ? []
          : [
              {
                property: "inverse",
                label: t("property.inverse"),
                value: inverse.label ?? findLocalName(inverse.uri),
              },
            ]),
      ]}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={PROPERTY_MARK_ICON} />}
      prefix={prefix}
      status={data.functional ? t("property.functional") : undefined}
      summary={data.definition ?? undefined}
      title={data.label ?? findLocalName(data.uri)}
    />
  );
}
