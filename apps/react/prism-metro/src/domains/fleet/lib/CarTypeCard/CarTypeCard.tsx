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
import nodeFragment from "#relay/__generated__/CarTypeCard_node.graphql.js";
import { CAR_TYPE_MARK_ICON } from "../CarTypeChip/constants.js";
import formatLength from "../formatLength.js";
import type { CarTypeCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields CarTypeCard reads from the CarType it renders: what its slots
 * show, and its compact address, which its home is resolved from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment CarTypeCard_node on CarType {
    __typename
    code
    hasCab
    length
    capacity
    _meta {
      title
      curie
      definition
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds car-type-card";

/**
 * A car type as a card: its mark, its prefix off the page's namespace, its
 * name linked to its home, its definition, and its code, whether it has a
 * driving cab, its length and its capacity as facts. It has no depiction,
 * so it draws no specimen. It states no address and no kind: the peek's
 * line carries the address, and its mark says the type.
 * Its mark is the car type's glyph, a published icon.
 *
 * Native props reach the card's `<div>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { CarTypeCard } from "#domains/fleet";`
 *
 * @implements metro.component.car_type_card
 * @note Impure: reads its car type from the Relay store, its home from the
 *   site's homes, and its link and the page's namespace from the
 *   projection providers, and its words from the translator in scope.
 */
export default function CarTypeCard({
  node,
  className,
  ...props
}: CarTypeCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, definition, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(curie);
  const t = useMessages();
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      facts={[
        {
          property: "code",
          label: t("fleet.fact.code"),
          value: <code className="identifier">{data.code}</code>,
        },
        {
          property: "cab",
          label: t("fleet.fact.cab"),
          value: data.hasCab ? t("fleet.yes") : t("fleet.no"),
        },
        {
          property: "length",
          label: t("fleet.fact.length"),
          value: formatLength(data.length),
        },
        {
          property: "capacity",
          label: t("fleet.fact.capacity"),
          value: t("fleet.passengers.count", { count: data.capacity }),
        },
      ]}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={CAR_TYPE_MARK_ICON} />}
      prefix={prefix}
      summary={definition ?? undefined}
      title={title}
    />
  );
}
