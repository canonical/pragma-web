// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/OntologyClassCard_node.graphql.js";
import { useMessages } from "../../i18n/index.js";
import { useProjectionLink } from "../../projections/index.js";
import { EntityCard } from "../../ui/index.js";
import { findCuriePrefix } from "../../utils/index.js";
import type { OntologyClassCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields OntologyClassCard reads from the OntologyClass it renders: its
 * title and compact address, whether it is abstract, its definition and
 * its superclass's title.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment OntologyClassCard_node on OntologyClass {
    __typename
    isAbstract
    definition
    _meta {
      title
      curie
    }
    superclass {
      _meta {
        title
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds ontology-class-card";

/**
 * An ontology class as a card in a grid of entities: its title as the
 * heading, linked to its home when the site has one and inert text when it
 * has none, and its superclass after the subclass sign (`Layout ⊂
 * UIBlock`); then "Abstract class in ds", its abstraction in its
 * namespace's prefix; then its definition. A class whose address did not
 * compact names its abstraction alone; a class without a superclass shows
 * its title alone. A class has no key values or vitals of its own.
 *
 * Native props reach the card's `<div>` root; a consumer `className` merges
 * after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { OntologyClassCard } from "@canonical/prism-projections";`
 *
 * @implements prism.component.ontology_class_card
 * @note Impure: reads its class from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its kind from
 *   the translator in scope.
 */
export default function OntologyClassCard({
  node,
  className,
  ...props
}: OntologyClassCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  const kind = t(data.isAbstract ? "class.kind.abstract" : "class.kind");
  const prefix = findCuriePrefix(curie);
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={
        prefix === undefined
          ? kind
          : t("entity.context", { kind, location: prefix })
      }
      LinkComponent={LinkComponent}
      parent={data.superclass?._meta.title}
      parentRelation="subclass"
      summary={data.definition ?? undefined}
      title={title}
    />
  );
}
