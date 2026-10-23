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
import nodeFragment from "../../../../relay/__generated__/ModifierCard_node.graphql.js";
import type { ModifierCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ModifierCard reads from the Modifier it renders: its title,
 * compact address, class, version and summary, and its family's title.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ModifierCard_node on Modifier {
    __typename
    version
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
 * A modifier as a card in a grid of entities: its namespace prefix above
 * the title (the schema gives a modifier no tier), the title linked to
 * its home when the site has one and inert text when it has none, then
 * its class and its summary; its class and its family as the key values,
 * each under a rule; and its version (`v1.11`) in the footer when it has
 * one. A modifier with no family has its class alone as a key value; an
 * empty summary is no summary. A modifier has no sidecar.
 *
 * Native props reach the card's `<div>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { ModifierCard } from "#domains/modifiers/lib";`
 *
 * @implements docs.component.modifier_card
 * @note Impure: reads its modifier from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its words
 *   from the translator in scope.
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
  const t = useMessages();
  const kind = data._meta.type._meta.title;
  const family = data.modifierFamily?._meta.title;
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      keyValues={[
        { key: t("modifier.class"), value: kind },
        ...(family === undefined
          ? []
          : [{ key: t("modifier.family"), value: family }]),
      ]}
      kind={kind}
      LinkComponent={LinkComponent}
      location={findCuriePrefix(curie)}
      summary={data.summary ? data.summary : undefined}
      title={title}
      vitals={
        data.version ? [t("block.version", { version: data.version })] : []
      }
    />
  );
}
