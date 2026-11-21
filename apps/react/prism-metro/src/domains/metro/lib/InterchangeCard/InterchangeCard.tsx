// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityCard,
  useForeignPrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/InterchangeCard_node.graphql.js";
import buildStopFacts from "../../buildStopFacts.js";
import { INTERCHANGE_MARK_ICON } from "../InterchangeChip/constants.js";
import type { InterchangeCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields InterchangeCard reads from the Interchange it renders: what its slots
 * show, and its compact address, which its home is resolved from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment InterchangeCard_node on Interchange {
    __typename
    location {
      latitude
      longitude
    }
    platformCount
    transferMinutes
    _meta {
      title
      curie
      definition
    }
    inZone {
      _meta {
        title
      }
    }
    servesLine {
      _meta {
        title
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds interchange-card";

/**
 * An interchange as a card: its mark, its prefix off the page's namespace,
 * its name linked to its home, its definition, and its platforms,
 * its fare zone, the lines it serves and its transfer time as facts, each
 * only when the graph asserts it. It states no address and no kind: the peek's
 * line carries the address, and its mark says the type.
 * Its mark is the interchange's glyph, a published icon.
 *
 * Native props reach the card's `<div>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { InterchangeCard } from "#domains/metro";`
 *
 * @implements metro.component.interchange_card
 * @note Impure: reads its interchange from the Relay store, its home from the
 *   site's homes, and its link and the page's namespace from the
 *   projection providers, and its words from the translator in scope.
 */
export default function InterchangeCard({
  node,
  className,
  ...props
}: InterchangeCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, definition, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(curie);
  const t = useMessages();
  const transfer = data.transferMinutes ?? undefined;
  const facts = [
    ...buildStopFacts(data, t),
    ...(transfer === undefined
      ? []
      : [
          {
            property: "transferMinutes",
            label: t("interchange.transfer"),
            value: t("interchange.transfer.minutes", { count: transfer }),
          },
        ]),
  ];
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      facts={facts.length === 0 ? undefined : facts}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={INTERCHANGE_MARK_ICON} />}
      prefix={prefix}
      summary={definition ?? undefined}
      title={title}
    />
  );
}
