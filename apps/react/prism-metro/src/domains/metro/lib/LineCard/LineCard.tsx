// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityCard,
  SwatchMark,
  useForeignPrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/LineCard_node.graphql.js";
import type { LineCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields LineCard reads from the Line it renders: what its slots
 * show, and its compact address, which its home is resolved from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment LineCard_node on Line {
    __typename
    colour
    _meta {
      title
      curie
      definition
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
 * A line as a card: its mark, its prefix off the page's namespace,
 * its name linked to its home, its definition, and its stop count and,
 * for a line run end to end, its ends as facts, with "loop" as its status
 * for a line that runs one. It states no address and no kind: the peek's
 * line carries the address, and its mark says the type.
 * Its mark is a disc of the line's colour (`SwatchMark`), which the
 * package paints only with a plain colour value.
 *
 * Native props reach the card's `<div>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { LineCard } from "#domains/metro";`
 *
 * @implements metro.component.line_card
 * @note Impure: reads its line from the Relay store, its home from the
 *   site's homes, and its link and the page's namespace from the
 *   projection providers, and its words from the translator in scope.
 */
export default function LineCard({
  node,
  className,
  ...props
}: LineCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, definition, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(curie);
  const t = useMessages();
  const loop = data.routes.some((route) => route.isLoop);
  const calls = loop ? [] : (data.routes.at(0)?.calls ?? []);
  const first = calls.at(0)?.stop._meta.title;
  const last = calls.at(-1)?.stop._meta.title;
  const facts = [
    {
      property: "servedBy",
      label: t("line.stops"),
      value: data.servedBy.length,
    },
    ...(first === undefined || last === undefined
      ? []
      : [
          {
            property: "routes",
            label: t("line.ends"),
            value: t("line.ends.value", { first, last }),
          },
        ]),
  ];
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      facts={facts}
      href={href}
      LinkComponent={LinkComponent}
      mark={<SwatchMark colour={data.colour} />}
      prefix={prefix}
      status={loop ? t("line.loop") : undefined}
      summary={definition ?? undefined}
      title={title}
    />
  );
}
