// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityCard,
  findCuriePrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "../../../../relay/__generated__/ModifierFamilyCard_node.graphql.js";
import type { ModifierFamilyCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ModifierFamilyCard reads from the ModifierFamily it renders:
 * its title, compact address, class and summary, and the address of each
 * of its modifiers, which it counts.
 * Every member is read in one page of the schema's largest size, 100: a
 * family holds a handful of modifiers.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ModifierFamilyCard_node on ModifierFamily {
    __typename
    summary
    _meta {
      title
      curie
      type {
        _meta {
          title
        }
      }
    }
    modifiers(first: 100) {
      edges {
        node {
          uri
        }
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds modifier-family-card";

/**
 * A modifier family as a card in a grid of entities: its namespace
 * prefix above the title (the schema gives a family no tier), the title
 * linked to its home when the site has one and inert text when it has
 * none, then its class and its summary; the count of its modifiers as
 * its one key value (`Members: 5`) and in the footer (`5 modifiers`). An
 * empty summary is no summary. A family has no sidecar.
 *
 * Native props reach the card's `<div>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { ModifierFamilyCard } from "#domains/modifiers/lib";`
 *
 * @implements docs.component.modifier_family_card
 * @note Impure: reads its family from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its words
 *   from the translator in scope.
 */
export default function ModifierFamilyCard({
  node,
  className,
  ...props
}: ModifierFamilyCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  const count = data.modifiers.edges.length;
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      keyValues={[{ key: t("family.members"), value: count }]}
      kind={data._meta.type._meta.title}
      LinkComponent={LinkComponent}
      location={findCuriePrefix(curie)}
      summary={data.summary ? data.summary : undefined}
      title={title}
      vitals={[t("family.modifiers", { count })]}
    />
  );
}
