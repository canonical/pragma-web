// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityRow, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/CarTypeRow_node.graphql.js";
import formatLength from "../formatLength.js";
import type { CarTypeRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** The fields CarTypeRow reads from the CarType it renders. */
const declareNodeFragment = (): unknown => graphql`
  fragment CarTypeRow_node on CarType {
    __typename
    code
    length
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds car-type-row";

/**
 * A car type as a 32px list entry: its code leading its name, the name
 * linked to the car type's page, and its length.
 *
 * Native props reach the root the EntityRow renders; a consumer
 * `className` merges after the projection's own, and the root carries the
 * typename as `data-type`.
 *
 * `import { CarTypeRow } from "./CarTypeRow/index.js";`
 *
 * @implements metro.component.car_type_row
 * @note Impure: reads its car type from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function CarTypeRow({
  node,
  className,
  ...props
}: CarTypeRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  return (
    <EntityRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      location={<code className="identifier">{data.code}</code>}
      meta={formatLength(data.length)}
      title={title}
    />
  );
}
