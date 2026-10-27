// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityChip, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/CarTypeChip_node.graphql.js";
import type { CarTypeChipProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** The fields CarTypeChip reads from the CarType it renders. */
const declareNodeFragment = (): unknown => graphql`
  fragment CarTypeChip_node on CarType {
    __typename
    code
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds car-type-chip";

/**
 * A car type as an inline mention: its code as the pill's lead, then its
 * name, linked to the car type's page; a consumer's children replace the
 * name.
 *
 * Native props reach the root the EntityChip renders; a consumer
 * `className` merges after the projection's own, and the root carries the
 * typename as `data-type`.
 *
 * `import { CarTypeChip } from "./CarTypeChip/index.js";`
 *
 * @implements metro.component.car_type_chip
 * @note Impure: reads its car type from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function CarTypeChip({
  node,
  children,
  className,
  ...props
}: CarTypeChipProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  return (
    <EntityChip
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      lead={data.code}
      value={children ?? title}
    />
  );
}
