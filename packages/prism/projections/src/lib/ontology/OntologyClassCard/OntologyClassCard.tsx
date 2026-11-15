// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/OntologyClassCard_node.graphql.js";
import { useMessages } from "../../i18n/index.js";
import {
  useForeignPrefix,
  useProjectionLink,
} from "../../projections/index.js";
import { EntityCard } from "../../ui/index.js";
import { CLASS_MARK_ICON } from "../constants.js";
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
 * An ontology class as a card in a grid of entities, in the slot order:
 * the class glyph as its mark, its namespace prefix when it differs from
 * the page's ambient one, its title as the heading, linked to its home
 * when the site has one and inert text when it has none; then its
 * definition, its superclass as a fact ("Subclass of UIBlock") and, for an
 * abstract class, the word "abstract" as its status. It passes no address,
 * which the peek's own line shows in full, and no kind, which its mark
 * states. A class without a superclass states no fact.
 *
 * It is the card's arm for `OntologyClass`: `CardProjection` renders it.
 *
 * Native props reach the card's `<div>` root; a consumer `className` merges
 * after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { OntologyClassCard } from "@canonical/prism-projections";`
 *
 * @implements prism.component.ontology_class_card
 * @note Impure: reads its class from the Relay store, its home from the
 *   site's homes, its link from the projection provider, the page's
 *   ambient namespace and its words from the translator in scope.
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
  const prefix = useForeignPrefix(curie);
  const superclass = data.superclass?._meta.title;
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      facts={
        superclass === undefined
          ? undefined
          : [
              {
                property: "superclass",
                label: t("class.superclass"),
                value: superclass,
              },
            ]
      }
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={CLASS_MARK_ICON} />}
      prefix={prefix}
      status={data.isAbstract ? t("class.abstract") : undefined}
      summary={data.definition ?? undefined}
      title={title}
    />
  );
}
