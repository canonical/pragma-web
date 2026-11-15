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
import nodeFragment from "../../../../relay/__generated__/ModifierCard_node.graphql.js";
import { MODIFIER_MARK_ICON } from "../ModifierChip/constants.js";
import type { ModifierCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ModifierCard reads from the Modifier it renders: its title and
 * compact address, its version, its Markdown summary, and the title of its
 * family.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ModifierCard_node on Modifier {
    __typename
    version
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

const componentCssClassName = "ds modifier-card";

/**
 * A modifier as a card in a grid of entities: the modifier's mark, its
 * prefix when the modifier is off the page's namespace, its title, linked
 * to its home when the site has one and inert text when it has none, the
 * first paragraph of its Markdown summary, rendered inline so its
 * emphasis, code and links read as they do in the modifier's
 * documentation, and its family and its version (`v1.11`) as its facts,
 * each when it has one. A summary with no paragraph is no summary. A
 * modifier has no depiction, so its card draws no specimen.
 *
 * Native props reach the card's `<div>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { ModifierCard } from "#domains/modifiers/lib";`
 *
 * @implements docs.component.modifier_card
 * @note Impure: reads its modifier from the Relay store, its home from the
 *   site's homes, its words from the site's catalog, and its link and the
 *   page's namespace from the projection providers.
 */
export default function ModifierCard({
  node,
  className,
  ...props
}: ModifierCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(curie);
  const t = useMessages();
  const family = data.modifierFamily?._meta.title;
  const facts = [
    family === undefined
      ? undefined
      : {
          property: "modifierFamily",
          label: t("modifier.family"),
          value: family,
        },
    data.version
      ? {
          property: "version",
          label: t("block.versionLabel"),
          value: t("block.version", { version: data.version }),
        }
      : undefined,
  ].filter((fact) => fact !== undefined);
  const summary = findFirstParagraph(data.summary ?? "");
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      facts={facts.length === 0 ? undefined : facts}
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
