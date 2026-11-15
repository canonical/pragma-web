// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityRow,
  useForeignPrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/UnitRow_node.graphql.js";
import formatLength from "../formatLength.js";
import { UNIT_MARK_ICON } from "../UnitChip/constants.js";
import type { UnitRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields UnitRow reads from the Unit it renders: what its slots
 * show, and its compact address, which its home is resolved from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment UnitRow_node on Unit {
    __typename
    length
    _meta {
      title
      curie
      definition
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds unit-row";

/**
 * A unit as a list entry: its mark, its prefix off the page's
 * namespace, its name linked to its home, and its length as a fact; a
 * two-line row (`lines="two"`) puts its definition under the name.
 * Its mark is the unit's glyph, a published icon.
 *
 * Native props reach the row's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { UnitRow } from "#domains/fleet";`
 *
 * @implements metro.component.unit_row
 * @note Impure: reads its unit from the Relay store, its home from the
 *   site's homes, and its link and the page's namespace from the
 *   projection providers, and its words from the translator in scope.
 */
export default function UnitRow({
  node,
  className,
  ...props
}: UnitRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, definition, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(curie);
  const t = useMessages();
  return (
    <EntityRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      facts={[
        {
          property: "length",
          label: t("fleet.fact.length"),
          value: formatLength(data.length),
        },
      ]}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={UNIT_MARK_ICON} />}
      prefix={prefix}
      summary={definition ?? undefined}
      title={title}
    />
  );
}
