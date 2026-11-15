// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityCard,
  useForeignPrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import { Icon } from "@canonical/react-ds-global";
import { Markdown } from "@canonical/react-markdown";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import { findFirstParagraph, SUMMARY_COMPONENTS } from "#lib/markdown";
import nodeFragment from "../../../../relay/__generated__/ModifierFamilyCard_node.graphql.js";
import { MODIFIER_FAMILY_MARK_ICON } from "../ModifierFamilyChip/constants.js";
import type { ModifierFamilyCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ModifierFamilyCard reads from the ModifierFamily it renders:
 * its title and compact address, its Markdown summary, and the address of
 * each of its modifiers, which it counts.
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
 * A modifier family as a card in a grid of entities: the family's mark,
 * its prefix when the family is off the page's namespace, its title,
 * linked to its home when the site has one and inert text when it has
 * none, the first paragraph of its Markdown summary, rendered inline so
 * its emphasis, code and links read as they do in the family's
 * documentation, and the count of its modifiers as its one fact. A summary
 * with no paragraph is no summary. A family has no depiction, so its card
 * draws no specimen.
 *
 * Native props reach the card's `<div>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { ModifierFamilyCard } from "#domains/modifiers/lib";`
 *
 * @implements docs.component.modifier_family_card
 * @note Impure: reads its family from the Relay store, its home from the
 *   site's homes, its words from the site's catalog, and its link and the
 *   page's namespace from the projection providers.
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
  const prefix = useForeignPrefix(curie);
  const t = useMessages();
  const summary = findFirstParagraph(data.summary ?? "");
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      facts={[
        {
          property: "modifiers",
          label: t("family.members"),
          value: data.modifiers.edges.length,
        },
      ]}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={MODIFIER_FAMILY_MARK_ICON} />}
      prefix={prefix}
      summary={
        summary === "" ? undefined : (
          <Markdown components={SUMMARY_COMPONENTS} source={summary} />
        )
      }
      title={title}
    />
  );
}
