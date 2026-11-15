// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityRow,
  useForeignPrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import { Icon } from "@canonical/react-ds-global";
import { Markdown } from "@canonical/react-markdown";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import { findFirstParagraph, SUMMARY_COMPONENTS } from "#lib/markdown";
import nodeFragment from "../../../../relay/__generated__/ModifierFamilyRow_node.graphql.js";
import { MODIFIER_FAMILY_MARK_ICON } from "../ModifierFamilyChip/constants.js";
import type { ModifierFamilyRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ModifierFamilyRow reads from the ModifierFamily it renders:
 * its title and compact address, its Markdown summary, and the address of
 * each of its modifiers, which it counts.
 * Every member is read in one page of the schema's largest size, 100: a
 * family holds a handful of modifiers.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ModifierFamilyRow_node on ModifierFamily {
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

const componentCssClassName = "ds modifier-family-row";

/**
 * A modifier family as a 32px list entry, or a 56px two-line one where an
 * index opts in: the family's mark, its prefix when the family is off the
 * page's namespace, its title, linked to its home when the site has one
 * and inert text when it has none, and the count of its modifiers as its
 * one fact. A two-line row puts the first paragraph of the family's
 * summary on its second line.
 *
 * Native props reach the row's `<li>` root; a consumer `className` merges
 * after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { ModifierFamilyRow } from "#domains/modifiers/lib";`
 *
 * @implements docs.component.modifier_family_row
 * @note Impure: reads its family from the Relay store, its home from the
 *   site's homes, its words from the site's catalog, and its link and the
 *   page's namespace from the projection providers.
 */
export default function ModifierFamilyRow({
  node,
  className,
  ...props
}: ModifierFamilyRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(curie);
  const t = useMessages();
  // The summary is the row's one second line: a paragraph's line breaks,
  // which the site's Markdown renders as breaks, join into spaces.
  const summary = findFirstParagraph(data.summary ?? "").replaceAll("\n", " ");
  return (
    <EntityRow
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
