// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityRow, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/UnitRow_node.graphql.js";
import formatLength from "../formatLength.js";
import type { UnitRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** The fields UnitRow reads from the Unit it renders. */
const declareNodeFragment = (): unknown => graphql`
  fragment UnitRow_node on Unit {
    __typename
    length
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds unit-row";

/**
 * A unit as a 32px list entry: its name, linked to the unit's page, and
 * its length.
 *
 * Native props reach the root the EntityRow renders; a consumer
 * `className` merges after the projection's own, and the root carries the
 * typename as `data-type`.
 *
 * `import { UnitRow } from "./UnitRow/index.js";`
 *
 * @implements metro.component.unit_row
 * @note Impure: reads its unit from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function UnitRow({
  node,
  className,
  ...props
}: UnitRowProps): ReactElement {
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
      meta={formatLength(data.length)}
      title={title}
    />
  );
}
