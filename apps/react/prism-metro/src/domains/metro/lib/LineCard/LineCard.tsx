// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCard, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/LineCard_node.graphql.js";
import type { LineCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields LineCard reads from the Line it renders: its name, its compact
 * address, its definition, its class's title, the stops it serves, and
 * each route's loop flag and the titles of the stops it calls at.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment LineCard_node on Line {
    __typename
    _meta {
      title
      curie
      definition
      type {
        _meta {
          title
        }
      }
    }
    servedBy {
      uri
    }
    routes {
      isLoop
      calls {
        stop {
          _meta {
            title
          }
        }
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds line-card";

/**
 * A line as a card in a grid of entities: its name, linked to the line's
 * page, its class and its definition; the count of its stops as a key
 * value and, for a line that runs end to end, its two end stations, the
 * first and the last calls of its first route; a loop has no ends and
 * carries "loop" as the footer's vital instead.
 *
 * Native props reach the card's `<div>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { LineCard } from "./lib/index.js";`
 *
 * @implements metro.component.line_card
 * @note Impure: reads its line from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its words from
 *   the translator in scope.
 */
export default function LineCard({
  node,
  className,
  ...props
}: LineCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title, definition, type } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  const loop = data.routes.some((route) => route.isLoop);
  const calls = loop ? [] : (data.routes.at(0)?.calls ?? []);
  const first = calls.at(0)?.stop._meta.title;
  const last = calls.at(-1)?.stop._meta.title;
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      keyValues={[
        { key: t("line.stops"), value: data.servedBy.length },
        ...(first === undefined || last === undefined
          ? []
          : [
              {
                key: t("line.ends"),
                value: t("line.ends.value", { first, last }),
              },
            ]),
      ]}
      kind={type._meta.title}
      LinkComponent={LinkComponent}
      summary={definition ?? undefined}
      title={title}
      vitals={loop ? [t("line.loop")] : []}
    />
  );
}
