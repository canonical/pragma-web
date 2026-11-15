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
import nodeFragment from "../../../../relay/__generated__/ModifierRow_node.graphql.js";
import { MODIFIER_MARK_ICON } from "../ModifierChip/constants.js";
import type { ModifierRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ModifierRow reads from the Modifier it renders: its title and
 * compact address, its Markdown summary, and the title of its family.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ModifierRow_node on Modifier {
    __typename
    summary
    _meta {
      title
      curie
    }
    modifierFamily {
      _meta {
        title
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds modifier-row";

/**
 * A modifier as a 32px list entry, or a 56px two-line one where an index
 * opts in: the modifier's mark, its prefix when the modifier is off the
 * page's namespace, its title, linked to its home when the site has one
 * and inert text when it has none, and its family as its one fact, when
 * it has one. A two-line row puts the first paragraph of the modifier's
 * summary on its second line.
 *
 * Native props reach the row's `<li>` root; a consumer `className` merges
 * after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { ModifierRow } from "#domains/modifiers/lib";`
 *
 * @implements docs.component.modifier_row
 * @note Impure: reads its modifier from the Relay store, its home from the
 *   site's homes, its words from the site's catalog, and its link and the
 *   page's namespace from the projection providers.
 */
export default function ModifierRow({
  node,
  className,
  ...props
}: ModifierRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(curie);
  const t = useMessages();
  const family = data.modifierFamily?._meta.title;
  // The summary is the row's one second line: a paragraph's line breaks,
  // which the site's Markdown renders as breaks, join into spaces.
  const summary = findFirstParagraph(data.summary ?? "").replaceAll("\n", " ");
  return (
    <EntityRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      facts={
        family === undefined
          ? undefined
          : [
              {
                property: "modifierFamily",
                label: t("modifier.family"),
                value: family,
              },
            ]
      }
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={MODIFIER_MARK_ICON} />}
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
